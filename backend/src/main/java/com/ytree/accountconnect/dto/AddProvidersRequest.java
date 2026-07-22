package com.ytree.accountconnect.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record AddProvidersRequest(@NotEmpty List<@NotNull String> providerIds) {}
