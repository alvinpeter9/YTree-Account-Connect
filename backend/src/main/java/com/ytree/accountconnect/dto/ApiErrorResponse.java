package com.ytree.accountconnect.dto;

import java.util.List;

public record ApiErrorResponse(String code, String message, List<String> details) {}
