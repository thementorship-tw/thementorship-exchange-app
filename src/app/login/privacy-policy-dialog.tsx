"use client";

import { Button } from "@/components/button";
import { Dialog } from "@/components/dialog";

export function PrivacyPolicyDialog({
  open,
  onClose,
  onAccept,
}: {
  open: boolean;
  onClose: () => void;
  onAccept: () => void;
}) {
  return (
    <Dialog
      open={open}
      title="規範與隱私政策"
      onClose={onClose}
      actions={
        <>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
          >
            離開
          </Button>
          <Button
            size="sm"
            onClick={onAccept}
          >
            同意
          </Button>
        </>
      }
    >
      <p>
        為維護社群成員的交流品質與個人資料安全，使用本平台前請先閱讀並同意規範與隱私政策。你所填寫的技能與聯絡方式僅供曼陀號社群成員查看。
      </p>
    </Dialog>
  );
}
