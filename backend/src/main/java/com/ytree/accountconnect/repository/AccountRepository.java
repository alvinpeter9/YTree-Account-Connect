package com.ytree.accountconnect.repository;

import com.ytree.accountconnect.model.ClientAccount;
import com.ytree.accountconnect.model.Provider;
import com.ytree.accountconnect.model.Statement;
import org.springframework.stereotype.Repository;

import java.time.Clock;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public class AccountRepository {
    private final Map<String, ClientAccount> accounts = new LinkedHashMap<>();

    public AccountRepository(Clock clock) {
        LocalDate today = LocalDate.now(clock);
        accounts.put(
                "account-barclays",
                new ClientAccount(
                        "account-barclays",
                        new Provider("barclays", "Barclays"),
                        new Statement("barclays-june.pdf", today.minusWeeks(3))
                )
        );
        accounts.put(
                "account-hsbc",
                new ClientAccount("account-hsbc", new Provider("hsbc", "HSBC"), null)
        );
        accounts.put(
                "account-vanguard",
                new ClientAccount(
                        "account-vanguard",
                        new Provider("vanguard", "Vanguard"),
                        new Statement("vanguard-old.pdf", today.minusMonths(5))
                )
        );
    }

    public synchronized List<ClientAccount> findAll() {
        return new ArrayList<>(accounts.values());
    }

    public synchronized Optional<ClientAccount> findById(String id) {
        return Optional.ofNullable(accounts.get(id));
    }

    public synchronized void save(ClientAccount account) {
        accounts.put(account.id(), account);
    }

    public synchronized void deleteById(String id) {
        accounts.remove(id);
    }
}
