<?php

namespace App\Http\Controllers;

use App\Models\Person;
use Illuminate\Http\Request;

class PersonController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $query = Person::query();
        if (request('q')) {
            $q = request('q');
            $query->where(function ($w) use ($q) {
                $w->where('first_name', 'like', "%$q%")
                    ->orWhere('last_name', 'like', "%$q%")
                    ->orWhere('national_id', 'like', "%$q%")
                    ->orWhere('cin_number', 'like', "%$q%");
            });
        }
        if (request('sort') && in_array(request('sort'), ['first_name','last_name','birth_date'])) {
            $dir = request('dir', 'asc') === 'desc' ? 'desc' : 'asc';
            $query->orderBy(request('sort'), $dir);
        } else {
            $query->orderBy('last_name')->orderBy('first_name');
        }
        return response()->json($query->paginate(20));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'birth_date' => 'nullable|date',
            // Serie CI: 1-2 litere (ex: SB)
            'cin_series' => ['nullable','regex:/^[A-Za-z]{1,2}$/'],
            // Numar CI: 1-6 cifre
            'cin_number' => ['nullable','regex:/^[0-9]{1,6}$/'],
            'id_issue_date' => 'nullable|date',
            'id_expiry_date' => 'nullable|date|after_or_equal:id_issue_date',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'county' => 'nullable|string|max:100',
            // CNP: exact 13 cifre
            'national_id' => ['nullable','regex:/^[0-9]{13}$/'],
            'email' => 'nullable|email|max:150',
            'phone' => 'nullable|string|max:30',
            'notes' => 'nullable|string',
        ]);

        if (!empty($data['cin_series'])) {
            $data['cin_series'] = strtoupper($data['cin_series']);
        }

        if ($request->hasFile('id_photo')) {
            $path = $request->file('id_photo')->store('id_photos', 'public');
            $data['id_photo_path'] = $path;
        }

        $person = Person::create($data);
        return response()->json($person, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Person $person)
    {
        return response()->json($person);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Person $person)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Person $person)
    {
        $data = $request->validate([
            'first_name' => 'sometimes|required|string|max:100',
            'last_name' => 'sometimes|required|string|max:100',
            'birth_date' => 'nullable|date',
            'cin_series' => ['nullable','regex:/^[A-Za-z]{1,2}$/'],
            'cin_number' => ['nullable','regex:/^[0-9]{1,6}$/'],
            'id_issue_date' => 'nullable|date',
            'id_expiry_date' => 'nullable|date|after_or_equal:id_issue_date',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'county' => 'nullable|string|max:100',
            'national_id' => ['nullable','regex:/^[0-9]{13}$/'],
            'email' => 'nullable|email|max:150',
            'phone' => 'nullable|string|max:30',
            'notes' => 'nullable|string',
        ]);

        if (!empty($data['cin_series'])) {
            $data['cin_series'] = strtoupper($data['cin_series']);
        }

        if ($request->hasFile('id_photo')) {
            $path = $request->file('id_photo')->store('id_photos', 'public');
            $data['id_photo_path'] = $path;
        }

        $person->update($data);
        return response()->json($person);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Person $person)
    {
        $person->delete();
        return response()->json(['ok' => true]);
    }
}
