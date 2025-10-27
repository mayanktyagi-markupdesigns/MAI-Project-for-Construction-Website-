<?php

namespace App\Services;

use Google\Client as Google_Client;
use Google\Service\Drive as Google_Service_Drive;
use Google\Service\Drive\DriveFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Models\ProjectSubfolder;

class GoogleDriveService
{
    protected $client;

    public function __construct()
    {
        $this->client = new Google_Client();
        $this->client->setClientId(env('GOOGLE_CLIENT_ID'));
        $this->client->setClientSecret(env('GOOGLE_CLIENT_SECRET'));
        $this->client->addScope(Google_Service_Drive::DRIVE);
        $this->client->setAccessType('offline');
        $this->client->setRedirectUri(env('GOOGLE_REDIRECT_URI', 'http://localhost')); // Adjust for production
    }

    /**
     * Set the access token and handle refresh if needed.
     *
     * @param string|null $token Optional custom access token
     * @throws \Exception
     */
    public function setAccessToken($token = null)
    {
        $user = Auth::user();
        if (!$user) {
            throw new \Exception('No authenticated user found');
        }

        $accessToken = $token ?: $user->google_access_token;
        if (!$accessToken) {
            throw new \Exception('No access token available');
        }

        $this->client->setAccessToken(['access_token' => $accessToken]);

        // if ($this->client->isAccessTokenExpired()) {
        //     if ($user->google_refresh_token) {
        //         $this->client->fetchAccessTokenWithRefreshToken($user->google_refresh_token);
        //         $newToken = $this->client->getAccessToken();
        //         $user->google_access_token = $newToken['access_token'];
        //         $user->save();
        //         Log::info('Token refreshed successfully', ['user_id' => $user->id]);
        //     } else {
        //         Log::error('Access token expired with no refresh token', ['user_id' => $user->id]);
        //         throw new \Exception('Access token expired and no refresh token available. Please re-authenticate.');
        //     }
        // }
    }

    /**
     * Create a project folder and its subfolders on Google Drive.
     *
     * @param string $projectName
     * @param int $projectId
     * @return string The folder ID
     * @throws \Exception
     */
    public function createProjectFolder($projectName, $projectId)
    {
        $this->setAccessToken();
        $driveService = new Google_Service_Drive($this->client);

        $folderMetadata = new DriveFile([
            'name' => "Project_{$projectId}_$projectName",
            'mimeType' => 'application/vnd.google-apps.folder'
        ]);

        try {
            $folder = $driveService->files->create($folderMetadata, ['fields' => 'id']);
            $folderId = $folder->getId();

            if (!$folderId) {
                throw new \Exception('Failed to retrieve folder ID from Google Drive API');
            }

            $subfolders = [
                "BID",
                "Drawings Specs",
                "Project Docs",
                "Photos",
                "Schedule",
                "Submittals",
                "Permit",
                "Meetings",
                "Payment",
                "Insurance",
                "Daily Reports",
                "Safety",
                "Inspections",
                "RFI",
                "Correspondence",
                "Change Order",
                "CADD Files",
                "Closeout",
                "Misc",
                "Templates",
                "Procurement"
            ];
            
            foreach ($subfolders as $subfolder) {
                $subfolderMetadata = new DriveFile([
                    'name' => $subfolder,
                    'mimeType' => 'application/vnd.google-apps.folder',
                    'parents' => [$folderId]
                ]);
                $subfolderD = $driveService->files->create($subfolderMetadata, ['fields' => 'id']);
                $subfolderId = $subfolderD->getId();

                if (!$subfolderId) {
                    throw new \Exception("Failed to create subfolder: $subfolder");
                }

                // Save subfolder details to the database
                ProjectSubfolder::create([
                    'project_id' => $projectId,
                    'name' => $subfolder,
                    'drive_folder_id' => $subfolderId,
                ]);
            }

            Log::info('Project folder created', ['folderId' => $folderId]);
            return $folderId;

        } catch (\Google_Service_Exception $e) {
            Log::error('Google Drive API error during folder creation', [
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
                'errors' => $e->getErrors()
            ]);
            throw new \Exception('Failed to create project folder: ' . $e->getMessage());
        } catch (\Exception $e) {
            Log::error('Folder creation failed', ['message' => $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Upload a file to Google Drive.
     *
     * @param string $filePath Local file path
     * @param string $fileName Name of the file on Drive
     * @param string $parentFolderId Parent folder ID
     * @param string $subfolder Subfolder name
     * @return \Google\Service\Drive\DriveFile
     * @throws \Exception
     */
    public function uploadFile($filePath, $fileName, $parentFolderId, $subfolder)
    {
        if (!file_exists($filePath)) {
            Log::error('File not found at path', ['path' => $filePath]);
            throw new \Exception('Local file not found: ' . $filePath);
        }

        $this->setAccessToken();
        $driveService = new Google_Service_Drive($this->client);

        $subfolderId = $this->getOrCreateSubfolder($driveService, $parentFolderId, $subfolder);

        $fileMetadata = new DriveFile([
            'name' => $fileName,
            'parents' => [$subfolderId]
        ]);

        $content = file_get_contents($filePath);
        if ($content === false) {
            Log::error('Failed to read file content', ['path' => $filePath]);
            throw new \Exception('Unable to read file content');
        }

        try {
            $file = $driveService->files->create($fileMetadata, [
                'data' => $content,
                'mimeType' => mime_content_type($filePath),
                'uploadType' => 'multipart',
                'fields' => 'id, webViewLink'
            ]);

            Log::info('File uploaded to Google Drive', ['fileId' => $file->id]);
            return $file;

        } catch (\Google_Service_Exception $e) {
            Log::error('Google Drive API error during upload', [
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
                'details' => $e->getErrors()
            ]);
            throw $e;
        } catch (\Exception $e) {
            Log::error('Upload failed', ['message' => $e->getMessage(), 'path' => $filePath]);
            throw $e;
        }
    }

    /**
     * Download a file from Google Drive.
     *
     * @param string $fileId
     * @return string|null File content or null on failure
     */
    public function downloadFile($fileId)
    {
        $this->setAccessToken();
        $driveService = new Google_Service_Drive($this->client);

        try {
            $file = $driveService->files->get($fileId, ['alt' => 'media']);
            $content = $file->getBody()->getContents();
            Log::info('File downloaded from Google Drive', ['fileId' => $fileId]);
            return $content;
        } catch (\Google_Service_Exception $e) {
            Log::error('Failed to download file from Google Drive', [
                'fileId' => $fileId,
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
            ]);
            return null;
        }
    }

    /**
     * Get or create a subfolder within a parent folder.
     *
     * @param Google_Service_Drive $driveService
     * @param string $parentFolderId
     * @param string $subfolder
     * @return string Subfolder ID
     */
    protected function getOrCreateSubfolder($driveService, $parentFolderId, $subfolder)
    {
        $query = "mimeType='application/vnd.google-apps.folder' and name='$subfolder' and '$parentFolderId' in parents";
        $results = $driveService->files->listFiles([
            'q' => $query,
            'fields' => 'files(id)',
        ]);

        if (count($results->getFiles()) > 0) {
            return $results->getFiles()[0]->getId();
        }

        $subfolderMetadata = new DriveFile([
            'name' => $subfolder,
            'mimeType' => 'application/vnd.google-apps.folder',
            'parents' => [$parentFolderId]
        ]);

        $folder = $driveService->files->create($subfolderMetadata, ['fields' => 'id']);
        return $folder->getId();
    }

    /**
     * Get the OAuth authorization URL.
     *
     * @return string The authorization URL
     */
    public function getAuthUrl()
    {
        return $this->client->createAuthUrl();
    }

    /**
     * Handle OAuth callback and fetch token.
     *
     * @param string $code Authorization code
     * @return array Token response
     * @throws \Exception
     */
    public function handleCallback($code)
    {
        $this->client->fetchAccessTokenWithAuthCode($code);
        return $this->client->getAccessToken();
    }
}