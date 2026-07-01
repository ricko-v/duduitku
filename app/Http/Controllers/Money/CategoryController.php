<?php

namespace App\Http\Controllers\Money;

use App\Http\Controllers\Controller;
use App\Http\Requests\Money\StoreCategoryRequest;
use App\Http\Requests\Money\UpdateCategoryRequest;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $categories = $request->user()
            ->categories()
            ->with('parent')
            ->orderBy('type')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return Inertia::render('money/categories', [
            'categories' => $categories,
        ]);
    }

    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        $request->user()->categories()->create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Category created.')]);

        return to_route('money.categories.index');
    }

    public function update(UpdateCategoryRequest $request, Category $category): RedirectResponse
    {
        $category->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Category updated.')]);

        return to_route('money.categories.index');
    }

    public function destroy(Request $request, Category $category): RedirectResponse
    {
        $category->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Category deleted.')]);

        return to_route('money.categories.index');
    }
}
