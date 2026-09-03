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
      size="lg"
      scrollable
      actions={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            離開
          </Button>
          <Button size="sm" onClick={onAccept}>
            同意
          </Button>
        </>
      }
    >
      <article className="space-y-8 text-left text-body text-primary">
        <section aria-labelledby="mutual-benefit-title">
          <h3 id="mutual-benefit-title" className="text-h2">
            核心原則－互惠
          </h3>
          <p className="mt-3 border-l-2 border-brand px-4 py-2 text-body-strong">
            本平台的交換媒介僅限「時間、技能、經驗、興趣」，雙方基於互惠自願交流，不涉及任何金錢或商業對價。
          </p>
        </section>

        <section aria-labelledby="prohibited-title">
          <h3 id="prohibited-title" className="text-h2">
            曼陀號平台互惠禁止條例
          </h3>
          <ol className="mt-4 list-decimal space-y-6 pl-6 marker:font-semibold">
            <li className="pl-1">
              <h4 className="text-body-lg-strong">
                嚴禁任何形式的收費與變相收費行為
              </h4>
              <ul className="mt-3 list-disc space-y-3 pl-5">
                <li>
                  <strong>核心規範：</strong>
                  平台上所有的對接，其媒介只能是「時間、技能、經驗或興趣的實質交換」，不得涉及任何金錢對價關係。
                </li>
                <li>
                  <strong>禁止項目：</strong>
                  <ul className="mt-2 list-[circle] space-y-2 pl-5">
                    <li>
                      不得對交流內容、職涯建議直接收費，或要求「諮詢費」、「鐘點費」、「車馬費」等。
                    </li>
                    <li>
                      嚴禁任何變相收費手段（例如：要求對方必須先購買指定課程、訂閱專欄、或打賞／贊助指定平台，才願意提供交流協助）。
                    </li>
                  </ul>
                </li>
              </ul>
            </li>

            <li className="pl-1">
              <h4 className="text-body-lg-strong">
                嚴禁將平台作為商業獲客管道（Lead Generation）
              </h4>
              <ul className="mt-3 list-disc space-y-3 pl-5">
                <li>
                  <strong>核心規範：</strong>
                  交流檔案與初步聯繫必須誠實、透明，不得將同期學員視為商業開發（BD）或行銷對象。
                </li>
                <li>
                  <strong>禁止項目：</strong>
                  <ul className="mt-2 list-[circle] pl-5">
                    <li>
                      嚴禁以「免費交流」、「職涯分享」或「經驗互惠」為誘餌，吸引學員聯繫後，在站外推銷自己的付費課程、個人顧問服務、保險、金融理財商品或任何商業服務。
                    </li>
                  </ul>
                </li>
              </ul>
            </li>

            <li className="pl-1">
              <h4 className="text-body-lg-strong">
                嚴禁傳銷、直銷與各類組織招募（拉人頭）
              </h4>
              <ul className="mt-3 list-disc space-y-3 pl-5">
                <li>
                  <strong>核心規範：</strong>
                  平台不歡迎任何多層次傳銷、微商或非職場專業技能的組織性招募行為。
                </li>
                <li>
                  <strong>禁止項目：</strong>
                  <ul className="mt-2 list-[circle] space-y-2 pl-5">
                    <li>嚴禁招募下線、推廣多層次傳銷（直銷）組織。</li>
                    <li>
                      無論此類行為包裝成何種名義（如：「創業機會分享」、「被動收入建立」、「打造副業團隊合作」或「財商交流」等），只要涉及拉人頭、發展組織，一律嚴格禁止。
                    </li>
                  </ul>
                </li>
              </ul>
            </li>

            <li className="pl-1">
              <h4 className="text-body-lg-strong">
                嚴禁未經同意的商業合作邀約（外包、接案、招募）
              </h4>
              <ul className="mt-3 list-disc space-y-3 pl-5">
                <li>
                  <strong>核心規範：</strong>
                  本平台旨在解決「學員間跨職能的知識與資源交流需求」，「發包、找外包、企業徵才」屬於商業營利與人力資源範疇，不在本平台的設計初衷內。
                </li>
                <li>
                  <strong>禁止項目與團隊討論點：</strong>
                  <ul className="mt-2 list-[circle] space-y-2 pl-5">
                    <li>
                      <strong>禁止行為：</strong>
                      嚴禁直接在個人檔案張貼求才啟事、外包案件需求、或尋找接案合作夥伴（例如：「誠徵後端工程師接案，預算
                      X 萬」）。
                    </li>
                    <li className="rounded-8 bg-error-subtle px-3 py-2">
                      <strong>彈性空間：</strong>
                      💡
                      雙方自願且非主動推銷：檔案不得主動寫「找外包／找員工」，但如果是雙方在進行技能交換時（例如
                      UI
                      聊完覺得後端很強），「自願」延伸出後續的接案合作，則不在此限。
                    </li>
                  </ul>
                </li>
              </ul>
            </li>
          </ol>
        </section>

        <section aria-labelledby="interaction-boundaries-title">
          <h3 id="interaction-boundaries-title" className="text-h2">
            互動底線
          </h3>
          <ul className="mt-4 list-disc space-y-2 pl-5">
            <li>
              <strong>嚴禁宗教傳教與政治宣傳：</strong>
              交流主軸必須扣緊技能、職涯、興趣與工作資源。
            </li>
            <li>
              <strong>嚴禁仇恨、歧視與不當言論：</strong>
              確保檔案內容與互動交流維持友善的專業職場態度。
            </li>
            <li>對方未回應或拒絕後，不得重複發起聯繫或透過其他管道糾纏。</li>
            <li>
              禁止性騷擾、言語騷擾，以及任何讓對方感到不適的追求行為（平台不是交友軟體）。
            </li>
            <li>不得將他人的聯絡方式、檔案內容外流或轉作他用。</li>
            <li>不得冒用他人身份或填寫不實的技能資訊。</li>
          </ul>
        </section>

        <section aria-labelledby="violations-title">
          <h3 id="violations-title" className="text-h2">
            違規處理機制
          </h3>
          <ul className="mt-4 list-disc space-y-4 pl-5">
            <li>
              <strong>撤文與封鎖規則：</strong>
              <ul className="mt-2 list-[circle] space-y-2 pl-5">
                <li>
                  若個人檔案內容觸碰上述禁忌（包含引導學員去聽直銷說明會、私下收費等），管理團隊將不經告知直接撤除該交流檔案。
                </li>
                <li>
                  情節嚴重者（如被多位學員檢舉私下騷擾或強迫推銷），將直接停用該學員登入此平台的權限。
                </li>
              </ul>
            </li>
            <li>
              <strong>學員回報管道：</strong>
              <p className="mt-2 rounded-8 px-3 py-2">
                <strong>檢舉／回報表單：</strong>
                讓學員在遇到非預期的商業行為，或是騷擾行為時，可以截圖向引水人團隊反映。
              </p>
            </li>
          </ul>
        </section>
      </article>
    </Dialog>
  );
}
