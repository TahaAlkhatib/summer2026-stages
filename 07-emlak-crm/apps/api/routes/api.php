<?php

use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ContractController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DemandController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\InstallmentController;
use App\Http\Controllers\OwnerController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/agents', [AuthController::class, 'agents']);

    // Portföy
    Route::get('/properties/districts', [PropertyController::class, 'districts']);
    Route::apiResource('properties', PropertyController::class);

    // Mal sahibi ve müşteri
    Route::get('/owners', [OwnerController::class, 'index']);
    Route::post('/owners', [OwnerController::class, 'store']);
    Route::get('/customers', [CustomerController::class, 'index']);
    Route::post('/customers', [CustomerController::class, 'store']);
    Route::get('/customers/{customer}', [CustomerController::class, 'show']);

    // Talep ve otomatik eşleştirme
    Route::get('/demands', [DemandController::class, 'index']);
    Route::post('/demands', [DemandController::class, 'store']);
    Route::get('/demands/{demand}/matches', [DemandController::class, 'matches']);
    Route::put('/demands/{demand}/close', [DemandController::class, 'close']);

    // Randevular
    Route::get('/appointments', [AppointmentController::class, 'index']);
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::put('/appointments/{appointment}/complete', [AppointmentController::class, 'complete']);
    Route::put('/appointments/{appointment}/cancel', [AppointmentController::class, 'cancel']);

    // Sözleşmeler
    Route::get('/contracts', [ContractController::class, 'index']);
    Route::post('/contracts', [ContractController::class, 'store']);
    Route::get('/contracts/{contract}', [ContractController::class, 'show']);
    Route::put('/contracts/{contract}/terminate', [ContractController::class, 'terminate']);

    // Taksitler
    Route::get('/installments', [InstallmentController::class, 'index']);
    Route::put('/installments/{installment}/pay', [InstallmentController::class, 'pay']);
    Route::post('/installments/refresh-overdue', [InstallmentController::class, 'refreshOverdue']);

    // Evrak arşivi
    Route::get('/documents', [DocumentController::class, 'index']);
    Route::post('/documents', [DocumentController::class, 'store']);
    Route::get('/documents/{document}/download', [DocumentController::class, 'download']);
    Route::delete('/documents/{document}', [DocumentController::class, 'destroy']);

    // Raporlar
    Route::get('/reports/summary', [ReportController::class, 'summary']);
    Route::get('/reports/agents', [ReportController::class, 'agents']);
    Route::get('/reports/collections', [ReportController::class, 'collections']);
    Route::get('/reports/portfolio', [ReportController::class, 'portfolio']);
});
