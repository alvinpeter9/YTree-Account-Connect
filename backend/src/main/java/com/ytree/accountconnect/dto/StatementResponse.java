package com.ytree.accountconnect.dto;

import java.time.LocalDate;

public record StatementResponse(String fileName, LocalDate date) {}
