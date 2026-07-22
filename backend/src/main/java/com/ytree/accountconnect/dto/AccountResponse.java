package com.ytree.accountconnect.dto;

import com.ytree.accountconnect.model.StatementStatus;

public record AccountResponse(
        String id,
        ProviderResponse provider,
        StatementResponse statement,
        StatementStatus status
) {}
