package com.ytree.accountconnect.dto;

import java.util.List;

public record AccountsResponse(
        List<AccountResponse> accounts,
        int readyCount,
        int totalCount,
        boolean canSubmit
) {}
