<?php

namespace App\Policies;

use App\Models\CalibrationCertificate;
use App\Models\CalibrationReport;
use App\Models\Contract;
use App\Models\Document;
use App\Models\Quotation;
use App\Models\User;

class DocumentPolicy
{
    public function download(User $user, Document $document): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        // Check based on documentable or document_type
        if ($document->documentable instanceof CalibrationCertificate) {
            return $user->can('view', $document->documentable);
        }

        if ($document->documentable instanceof Contract) {
            return $user->can('view', $document->documentable);
        }

        if ($document->documentable instanceof Quotation) {
            return $user->can('view', $document->documentable);
        }

        if ($document->documentable instanceof CalibrationReport) {
            return $user->can('view', $document->documentable);
        }

        // Fallback checks by document_type
        if ($document->document_type === Document::TYPE_REPORT) {
            return $user->isAdmin() || $user->isManager() || $user->isMetrology() || $user->isCommercial();
        }

        if ($user->isClient()) {
            return false;
        }

        return true;
    }
}
