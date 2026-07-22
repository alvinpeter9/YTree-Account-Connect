package com.ytree.accountconnect.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record UploadStatementRequest(
        @NotNull @Size(min = 1, max = 255) String fileName,
        @NotNull LocalDate statementDate
) {}
