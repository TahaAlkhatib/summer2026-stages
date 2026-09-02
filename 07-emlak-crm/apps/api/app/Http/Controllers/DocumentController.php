<?php

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    public function index(Request $istek)
    {
        $sorgu = Document::with(['uploader', 'contract', 'property']);

        if ($istek->filled('contract_id')) {
            $sorgu->where('contract_id', $istek->contract_id);
        }
        if ($istek->filled('property_id')) {
            $sorgu->where('property_id', $istek->property_id);
        }
        if ($istek->filled('doc_type')) {
            $sorgu->where('doc_type', $istek->doc_type);
        }

        return $sorgu->orderByDesc('created_at')->get();
    }

    public function store(Request $istek)
    {
        $veri = $istek->validate([
            'file' => 'required|file|max:10240|mimes:pdf,jpg,jpeg,png,doc,docx',
            'doc_type' => 'required|in:tapu,kimlik,sozlesme,yoklama,dask,diger',
            'title' => 'required|string|max:255',
            'contract_id' => 'nullable|exists:contracts,id',
            'property_id' => 'nullable|exists:properties,id',
            'notes' => 'nullable|string',
        ], [
            'file.required' => 'Dosya seçilmelidir.',
            'file.max' => 'Dosya en fazla 10 MB olabilir.',
            'file.mimes' => 'Sadece PDF, JPG, PNG ve Word dosyaları yüklenebilir.',
            'doc_type.required' => 'Evrak türü seçilmelidir.',
            'title.required' => 'Evrak başlığı zorunludur.',
        ]);

        if (empty($veri['contract_id']) && empty($veri['property_id'])) {
            return response()->json([
                'message' => 'Evrak bir sözleşmeye veya portföye bağlanmalıdır.',
            ], 422);
        }

        $dosya = $istek->file('file');
        // Orijinal adı saklıyoruz ama diske rastgele adla yazıyoruz
        $yol = $dosya->store('documents', 'local');

        $evrak = Document::create([
            'contract_id' => $veri['contract_id'] ?? null,
            'property_id' => $veri['property_id'] ?? null,
            'doc_type' => $veri['doc_type'],
            'title' => $veri['title'],
            'file_name' => $dosya->getClientOriginalName(),
            'file_path' => $yol,
            'mime_type' => $dosya->getClientMimeType(),
            'file_size' => $dosya->getSize(),
            'uploaded_by' => $istek->user()->id,
            'notes' => $veri['notes'] ?? null,
        ]);

        return response()->json($evrak->load('uploader'), 201);
    }

    public function download(Document $document)
    {
        if (!Storage::disk('local')->exists($document->file_path)) {
            return response()->json(['message' => 'Dosya sunucuda bulunamadı.'], 404);
        }

        return Storage::disk('local')->download($document->file_path, $document->file_name);
    }

    public function destroy(Request $istek, Document $document)
    {
        if ($istek->user()->role !== 'admin') {
            return response()->json(['message' => 'Evrak silmek için yönetici olmalısınız.'], 403);
        }

        Storage::disk('local')->delete($document->file_path);
        $document->delete();

        return response()->json(['message' => 'Evrak silindi.']);
    }
}
