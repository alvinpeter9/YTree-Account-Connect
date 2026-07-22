import { useState } from "react";
import { api } from "../api/client";
import type { Account } from "../types";
import { field, fieldInput, primaryButton, secondaryButton } from "../ui";
import { Modal } from "./Modal";

interface Props {
  account: Account;
  onClose: () => void;
  onSaved: () => void;
  onError: (message: string) => void;
}

export function StatementModal({ account, onClose, onSaved, onError }: Props) {
  const [fileName, setFileName] = useState("");
  const [date, setDate] = useState(account.statement?.date ?? "");
  const [saving, setSaving] = useState(false);
  const isReplacing = account.statement !== null;
  const today = new Date().toISOString().slice(0, 10);

  const save = async () => {
    setSaving(true);
    try {
      await api.uploadStatement(account.id, fileName, date);
      onSaved();
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "Could not save the statement.",
      );
      setSaving(false);
    }
  };

  return (
    <Modal
      title={`${isReplacing ? "Replace" : "Upload"} ${account.provider.name} statement`}
      description="Choose a file and statement date. For this demo, only the file name is recorded; the file itself is not uploaded."
      onClose={onClose}
      footer={
        <>
          <button className={secondaryButton} onClick={onClose}>
            Cancel
          </button>
          <button
            className={primaryButton}
            disabled={!fileName.trim() || !date || saving}
            onClick={save}
          >
            {saving ? "Saving…" : "Save statement"}
          </button>
        </>
      }
    >
      <div className="grid gap-5">
        <label className={field}>
          <span>Statement file</span>
          <input
            className={fieldInput}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(event) =>
              setFileName(event.target.files?.[0]?.name ?? "")
            }
          />
          <small className="font-normal text-[#7b8680]">
            {fileName
              ? `Selected: ${fileName}`
              : `${isReplacing ? "Choose a new file. " : ""}PDF, PNG or JPG.`}
          </small>
        </label>
        <label className={field}>
          <span>Statement date</span>
          <input
            className={fieldInput}
            type="date"
            value={date}
            max={today}
            onChange={(event) => setDate(event.target.value)}
          />
          <small className="font-normal text-[#7b8680]">
            Statements over three months old will need replacing.
          </small>
        </label>
      </div>
    </Modal>
  );
}
