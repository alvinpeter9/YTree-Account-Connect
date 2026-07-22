package com.ytree.accountconnect.mapper;

import com.ytree.accountconnect.dto.AccountResponse;
import com.ytree.accountconnect.dto.ProviderResponse;
import com.ytree.accountconnect.dto.StatementResponse;
import com.ytree.accountconnect.model.ClientAccount;
import com.ytree.accountconnect.model.Provider;
import com.ytree.accountconnect.model.StatementStatus;

public final class AccountMapper {
    private AccountMapper() {}

    public static AccountResponse toResponse(ClientAccount account, StatementStatus status) {
        var statement = account.statement() == null
                ? null
                : new StatementResponse(account.statement().fileName(), account.statement().date());

        return new AccountResponse(
                account.id(),
                toResponse(account.provider()),
                statement,
                status
        );
    }

    public static ProviderResponse toResponse(Provider provider) {
        return new ProviderResponse(provider.id(), provider.name());
    }
}
