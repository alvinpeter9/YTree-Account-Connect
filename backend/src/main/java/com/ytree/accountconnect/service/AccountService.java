package com.ytree.accountconnect.service;

import com.ytree.accountconnect.dto.AccountResponse;
import com.ytree.accountconnect.dto.AccountsResponse;
import com.ytree.accountconnect.dto.ProviderResponse;
import com.ytree.accountconnect.exception.ApiException;
import com.ytree.accountconnect.mapper.AccountMapper;
import com.ytree.accountconnect.model.ClientAccount;
import com.ytree.accountconnect.model.Provider;
import com.ytree.accountconnect.model.Statement;
import com.ytree.accountconnect.model.StatementStatus;
import com.ytree.accountconnect.repository.AccountRepository;
import com.ytree.accountconnect.repository.ProviderRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@Service
public class AccountService {
    private final AccountRepository accounts;
    private final ProviderRepository providers;
    private final Clock clock;

    public AccountService(AccountRepository accounts, ProviderRepository providers, Clock clock) {
        this.accounts = accounts;
        this.providers = providers;
        this.clock = clock;
    }

    public AccountsResponse getAccounts() {
        List<AccountResponse> accountResponses = accounts.findAll()
                .stream()
                .map(account -> AccountMapper.toResponse(account, statusOf(account.statement())))
                .toList();
        int readyCount = (int) accountResponses.stream()
                .filter(account -> account.status() == StatementStatus.UPLOADED)
                .count();

        return new AccountsResponse(
                accountResponses,
                readyCount,
                accountResponses.size(),
                !accountResponses.isEmpty() && readyCount == accountResponses.size()
        );
    }

    public List<ProviderResponse> getAvailableProviders() {
        Set<String> selectedProviderIds = new HashSet<>();
        accounts.findAll().forEach(account -> selectedProviderIds.add(account.provider().id()));

        return providers.findAll()
                .stream()
                .filter(provider -> !selectedProviderIds.contains(provider.id()))
                .map(AccountMapper::toResponse)
                .toList();
    }

    public AccountsResponse addProviders(List<String> providerIds) {
        validateProviderIds(providerIds);

        Set<String> existingProviderIds = new HashSet<>();
        accounts.findAll().forEach(account -> existingProviderIds.add(account.provider().id()));

        List<Provider> selectedProviders = providerIds.stream()
                .map(id -> findProviderToAdd(id, existingProviderIds))
                .toList();
        selectedProviders.forEach(provider ->
                accounts.save(new ClientAccount(UUID.randomUUID().toString(), provider, null))
        );

        return getAccounts();
    }

    public AccountsResponse removeAccount(String accountId) {
        requireAccount(accountId);
        accounts.deleteById(accountId);
        return getAccounts();
    }

    public AccountsResponse uploadStatement(String accountId, String fileName, LocalDate date) {
        ClientAccount account = requireAccount(accountId);
        String cleanName = fileName == null ? "" : fileName.trim();

        if (cleanName.isEmpty() || cleanName.length() > 255) {
            throw badRequest("INVALID_FILE_NAME", "Enter a file name between 1 and 255 characters.");
        }
        if (date == null) {
            throw badRequest("MISSING_STATEMENT_DATE", "Enter the statement date.");
        }
        if (date.isAfter(LocalDate.now(clock))) {
            throw badRequest("FUTURE_STATEMENT_DATE", "The statement date cannot be in the future.");
        }

        accounts.save(account.withStatement(new Statement(cleanName, date)));
        return getAccounts();
    }

    public void submit() {
        AccountsResponse state = getAccounts();
        if (state.totalCount() == 0) {
            throw new ApiException(
                    HttpStatus.CONFLICT,
                    "NO_ACCOUNTS",
                    "Add at least one provider before submitting."
            );
        }
        if (!state.canSubmit()) {
            List<String> details = state.accounts()
                    .stream()
                    .filter(account -> account.status() != StatementStatus.UPLOADED)
                    .map(account -> account.provider().name() + ": " + account.status().name().toLowerCase())
                    .toList();
            throw new ApiException(
                    HttpStatus.CONFLICT,
                    "ACCOUNTS_NOT_READY",
                    "Every provider needs a current statement.",
                    details
            );
        }
    }

    StatementStatus statusOf(Statement statement) {
        if (statement == null) {
            return StatementStatus.MISSING;
        }
        return statement.date().isBefore(LocalDate.now(clock).minusMonths(3))
                ? StatementStatus.OUTDATED
                : StatementStatus.UPLOADED;
    }

    private void validateProviderIds(List<String> providerIds) {
        if (providerIds == null || providerIds.isEmpty()) {
            throw badRequest("EMPTY_SELECTION", "Select at least one provider.");
        }
        if (providerIds.stream().anyMatch(Objects::isNull)) {
            throw badRequest("INVALID_PROVIDER", "Provider IDs cannot be null.");
        }
        if (new LinkedHashSet<>(providerIds).size() != providerIds.size()) {
            throw badRequest("DUPLICATE_SELECTION", "A provider was selected more than once.");
        }
    }

    private Provider findProviderToAdd(String providerId, Set<String> existingProviderIds) {
        if (existingProviderIds.contains(providerId)) {
            throw new ApiException(
                    HttpStatus.CONFLICT,
                    "PROVIDER_ALREADY_ADDED",
                    "That provider is already in your accounts."
            );
        }
        return providers.findById(providerId)
                .orElseThrow(() -> badRequest("UNKNOWN_PROVIDER", "Unknown provider: " + providerId));
    }

    private ClientAccount requireAccount(String accountId) {
        return accounts.findById(accountId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "ACCOUNT_NOT_FOUND",
                        "Account not found."
                ));
    }

    private ApiException badRequest(String code, String message) {
        return new ApiException(HttpStatus.BAD_REQUEST, code, message);
    }
}
