package com.ytree.accountconnect.controller;

import com.ytree.accountconnect.dto.AddProvidersRequest;
import com.ytree.accountconnect.dto.AccountsResponse;
import com.ytree.accountconnect.dto.ProviderResponse;
import com.ytree.accountconnect.dto.SubmissionResponse;
import com.ytree.accountconnect.dto.UploadStatementRequest;
import com.ytree.accountconnect.service.AccountService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class AccountController {
    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping("/accounts")
    public AccountsResponse getAccounts() {
        return accountService.getAccounts();
    }

    @GetMapping("/providers/available")
    public List<ProviderResponse> getAvailableProviders() {
        return accountService.getAvailableProviders();
    }

    @PostMapping("/accounts")
    @ResponseStatus(HttpStatus.CREATED)
    public AccountsResponse addProviders(@Valid @RequestBody AddProvidersRequest request) {
        return accountService.addProviders(request.providerIds());
    }

    @DeleteMapping("/accounts/{id}")
    public AccountsResponse removeAccount(@PathVariable String id) {
        return accountService.removeAccount(id);
    }

    @PutMapping("/accounts/{id}/statement")
    public AccountsResponse uploadStatement(
            @PathVariable String id,
            @Valid @RequestBody UploadStatementRequest request
    ) {
        return accountService.uploadStatement(id, request.fileName(), request.statementDate());
    }

    @PostMapping("/submissions")
    @ResponseStatus(HttpStatus.CREATED)
    public SubmissionResponse submit() {
        accountService.submit();
        return new SubmissionResponse("SUBMITTED", "Your statements have been submitted.");
    }
}
