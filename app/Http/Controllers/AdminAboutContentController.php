<?php

namespace App\Http\Controllers;

use App\Models\AboutContent;
use App\Models\AboutStage;
use App\Models\AboutPoint;
use App\Models\AboutCard;
use Illuminate\Http\Request;

class AdminAboutContentController extends Controller
{
    public function index()
    {
        $aboutContents = AboutContent::with(['stages.points', 'cards'])->get();
        return view('admin.about-content.index', compact('aboutContents'));
    }

    public function create()
    {
        return view('admin.about-content.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'slug' => 'required|unique:about_contents|alpha_dash',
            'title' => 'nullable|string|max:255',
            'content' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        AboutContent::create($validated);

        return redirect()->route('admin.about-content.index')->with('success', 'About content created successfully.');
    }

    public function edit($id)
    {
        $aboutContent = AboutContent::with(['stages.points', 'cards'])->findOrFail($id);
        return view('admin.about-content.edit', compact('aboutContent'));
    }

    public function update(Request $request, $id)
    {
        $aboutContent = AboutContent::findOrFail($id);

        $validated = $request->validate([
            'slug' => 'required|alpha_dash|unique:about_contents,slug,' . $id,
            'title' => 'nullable|string|max:255',
            'content' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        $aboutContent->update($validated);

        return redirect()->route('admin.about-content.index')->with('success', 'About content updated successfully.');
    }

    public function destroy($id)
    {
        $aboutContent = AboutContent::findOrFail($id);
        $aboutContent->delete();

        return redirect()->route('admin.about-content.index')->with('success', 'About content deleted successfully.');
    }

    // Manage stages for a specific about content
    public function manageStages($id)
    {
        $aboutContent = AboutContent::with('stages.points')->findOrFail($id);
        return view('admin.about-content.stages', compact('aboutContent'));
    }

    public function storeStage(Request $request, $id)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'video' => 'nullable|url',
        ]);

        $aboutContent = AboutContent::findOrFail($id);
        $aboutContent->stages()->create($validated);

        return redirect()->back()->with('success', 'Stage created successfully.');
    }

    public function updateStage(Request $request, $stageId)
    {
        $stage = AboutStage::findOrFail($stageId);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'video' => 'nullable|url',
        ]);

        $stage->update($validated);

        return redirect()->back()->with('success', 'Stage updated successfully.');
    }

    public function destroyStage($stageId)
    {
        $stage = AboutStage::findOrFail($stageId);
        $stage->delete();

        return redirect()->back()->with('success', 'Stage deleted successfully.');
    }

    // Manage points for a specific stage
    public function managePoints($stageId)
    {
        $stage = AboutStage::with(['points', 'aboutContent'])->findOrFail($stageId);
        return view('admin.about-content.points', compact('stage'));
    }

    public function storePoint(Request $request, $stageId)
    {
        $validated = $request->validate([
            'point' => 'required|string',
        ]);

        $stage = AboutStage::findOrFail($stageId);
        $stage->points()->create($validated);

        return redirect()->back()->with('success', 'Point created successfully.');
    }

    public function updatePoint(Request $request, $pointId)
    {
        $point = AboutPoint::findOrFail($pointId);

        $validated = $request->validate([
            'point' => 'required|string',
        ]);

        $point->update($validated);

        return redirect()->back()->with('success', 'Point updated successfully.');
    }

    public function destroyPoint($pointId)
    {
        $point = AboutPoint::findOrFail($pointId);
        $point->delete();

        return redirect()->back()->with('success', 'Point deleted successfully.');
    }

    // Manage cards for a specific about content
    public function manageCards($id)
    {
        $aboutContent = AboutContent::with('cards')->findOrFail($id);
        return view('admin.about-content.cards', compact('aboutContent'));
    }

    public function storeCard(Request $request, $id)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
        ]);

        $aboutContent = AboutContent::findOrFail($id);
        $aboutContent->cards()->create($validated);

        return redirect()->back()->with('success', 'Card created successfully.');
    }

    public function updateCard(Request $request, $cardId)
    {
        $card = AboutCard::findOrFail($cardId);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
        ]);

        $card->update($validated);

        return redirect()->back()->with('success', 'Card updated successfully.');
    }

    public function destroyCard($cardId)
    {
        $card = AboutCard::findOrFail($cardId);
        $card->delete();

        return redirect()->back()->with('success', 'Card deleted successfully.');
    }
}
