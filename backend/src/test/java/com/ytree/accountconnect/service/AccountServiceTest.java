package com.ytree.accountconnect.service;

import com.ytree.accountconnect.exception.ApiException;
import com.ytree.accountconnect.model.ClientAccount;
import com.ytree.accountconnect.model.Provider;
import com.ytree.accountconnect.model.Statement;
import com.ytree.accountconnect.model.StatementStatus;
import com.ytree.accountconnect.repository.AccountRepository;
import com.ytree.accountconnect.repository.ProviderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AccountServiceTest {
    private static final LocalDate TODAY = LocalDate.of(2026, 7, 20);

    @Mock
    private AccountRepository accounts;

    @Mock
    private ProviderRepository providers;

    private AccountService service;

    @BeforeEach
    void setUp() {
        Clock clock = Clock.fixed(
                TODAY.atStartOfDay(ZoneOffset.UTC).toInstant(),
                ZoneOffset.UTC
        );
        service = new AccountService(accounts, providers, clock);
    }

    @Test
    void treatsTheExactThreeMonthBoundaryAsCurrent() {
        when(accounts.findAll()).thenReturn(List.of(
                account(new Statement("statement.pdf", TODAY.minusMonths(3)))
        ));

        assertThat(service.getAccounts().accounts().get(0).status())
                .isEqualTo(StatementStatus.UPLOADED);
    }

    @Test
    void treatsAStatementBeforeTheBoundaryAsOutdated() {
        when(accounts.findAll()).thenReturn(List.of(
                account(new Statement("statement.pdf", TODAY.minusMonths(3).minusDays(1)))
        ));

        assertThat(service.getAccounts().accounts().get(0).status())
                .isEqualTo(StatementStatus.OUTDATED);
    }

    @Test
    void rejectsSubmissionAndIdentifiesEveryIncompleteProvider() {
        when(accounts.findAll()).thenReturn(List.of(account(null)));

        assertThatThrownBy(service::submit)
                .isInstanceOfSatisfying(ApiException.class, error -> {
                    assertThat(error.code()).isEqualTo("ACCOUNTS_NOT_READY");
                    assertThat(error.details()).containsExactly("HSBC: missing");
                });
    }

    @Test
    void rejectsFutureDatedStatements() {
        ClientAccount account = account(null);
        when(accounts.findById(account.id())).thenReturn(Optional.of(account));

        assertThatThrownBy(() ->
                service.uploadStatement(account.id(), "future.pdf", TODAY.plusDays(1))
        ).isInstanceOfSatisfying(
                ApiException.class,
                error -> assertThat(error.code()).isEqualTo("FUTURE_STATEMENT_DATE")
        );
    }

    private ClientAccount account(Statement statement) {
        return new ClientAccount(
                "account-1",
                new Provider("hsbc", "HSBC"),
                statement
        );
    }
}
