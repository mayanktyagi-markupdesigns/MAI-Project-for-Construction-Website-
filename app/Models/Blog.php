<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Blog extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'content',
        'author_id',
        'published_at',
        'status',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'featured_image',
        'views',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($post) {
            if (empty($post->slug)) {
                $post->slug = Str::slug($post->title);
            }
        });

        static::updating(function ($post) {
            if (empty($post->slug) || $post->isDirty('title')) {
                $post->slug = Str::slug($post->title);
            }
        });
    }

    // Scope for published posts
    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    /**
     * Relationship with User (author).
     */
    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
