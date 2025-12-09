<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('people', function (Blueprint $table) {
            $table->date('id_issue_date')->nullable()->after('cin_number');
            $table->date('id_expiry_date')->nullable()->after('id_issue_date');
        });
    }

    public function down(): void
    {
        Schema::table('people', function (Blueprint $table) {
            $table->dropColumn(['id_issue_date', 'id_expiry_date']);
        });
    }
};
