import {
  Document,
  Paragraph,
  TextRun,
  AlignmentType,
  HeadingLevel,
  Packer,
} from "docx";

type FieldValue = Record<string, string>;

function replacePlaceholders(text: string, values: FieldValue): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] || `{{${key}}}`);
}

export async function generateDelegationDoc(
  values: FieldValue
): Promise<Buffer> {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [
              new TextRun({ text: "委 任 状", bold: true, size: 32 }),
            ],
          }),
          new Paragraph({ spacing: { after: 200 }, children: [] }),
          new Paragraph({
            children: [
              new TextRun({
                text: `弁護士法人AURA　弁護士　${values.lawyerName || "藤原 洋一"}`,
                size: 24,
              }),
            ],
          }),
          new Paragraph({ spacing: { after: 200 }, children: [] }),
          new Paragraph({
            children: [
              new TextRun({
                text: "　私は、上記の者を代理人と定め、下記の権限を委任します。",
                size: 24,
              }),
            ],
          }),
          new Paragraph({ spacing: { after: 300 }, children: [] }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "記", bold: true, size: 24 })],
          }),
          new Paragraph({ spacing: { after: 200 }, children: [] }),
          new Paragraph({
            children: [
              new TextRun({
                text: `1. ${values.snsType || "インターネット上"}における発信者情報開示請求に関する一切の件`,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "2. 上記に関する裁判上及び裁判外の一切の行為",
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "3. 復代理人の選任",
                size: 24,
              }),
            ],
          }),
          new Paragraph({ spacing: { after: 400 }, children: [] }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: `${values.date || new Date().toLocaleDateString("ja-JP")}`,
                size: 24,
              }),
            ],
          }),
          new Paragraph({ spacing: { after: 300 }, children: [] }),
          new Paragraph({
            children: [
              new TextRun({ text: "委任者", size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: `住所: ${values.clientAddress || ""}`,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: `氏名: ${values.clientName || ""}　　　　　　　　㊞`,
                size: 24,
              }),
            ],
          }),
        ],
      },
    ],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}

export async function generateDisclosureRequestDoc(
  values: FieldValue
): Promise<Buffer> {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [
              new TextRun({
                text: "発信者情報開示請求書",
                bold: true,
                size: 32,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: `${values.date || new Date().toLocaleDateString("ja-JP")}`,
                size: 24,
              }),
            ],
          }),
          new Paragraph({ spacing: { after: 200 }, children: [] }),
          new Paragraph({
            children: [
              new TextRun({
                text: `${values.providerName || "[プロバイダ名]"} 御中`,
                size: 24,
              }),
            ],
          }),
          new Paragraph({ spacing: { after: 300 }, children: [] }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: "請求者", size: 24 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: `${values.clientName || ""}`,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: `代理人弁護士　${values.lawyerName || "藤原 洋一"}`,
                size: 24,
              }),
            ],
          }),
          new Paragraph({ spacing: { after: 200 }, children: [] }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({ text: "第１　請求の趣旨", bold: true, size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: `　貴社が管理する${values.snsType || "ウェブサイト"}において、下記の投稿を行った発信者の情報（氏名、住所、メールアドレス、IPアドレス、タイムスタンプ）を開示されたい。`,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({ text: "第２　対象投稿", bold: true, size: 24 }),
            ],
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: `　URL: ${values.targetUrl || "[対象投稿URL]"}`,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: "第３　侵害された権利",
                bold: true,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: `　${values.violatedRight || "名誉権（名誉毀損）"}`,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: "第４　権利侵害の理由",
                bold: true,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `　${values.reason || "[権利侵害の具体的な理由を記載]"}`,
                size: 24,
              }),
            ],
          }),
        ],
      },
    ],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}

export async function generateNoticeDoc(
  values: FieldValue
): Promise<Buffer> {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [
              new TextRun({ text: "通 知 書", bold: true, size: 32 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: values.date || new Date().toLocaleDateString("ja-JP"),
                size: 24,
              }),
            ],
          }),
          new Paragraph({ spacing: { after: 200 }, children: [] }),
          new Paragraph({
            children: [
              new TextRun({
                text: `${values.recipientName || "[相手方氏名]"} 殿`,
                size: 24,
              }),
            ],
          }),
          new Paragraph({ spacing: { after: 300 }, children: [] }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: `${values.clientName || ""} 代理人`,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: `弁護士　${values.lawyerName || "藤原 洋一"}`,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: `　当職は、${values.clientName || ""}の代理人として、貴殿に対し、以下のとおり通知します。`,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: `　貴殿は、${values.snsType || "インターネット上"}において、当職の依頼者に対する${values.violationType || "名誉毀損に該当する投稿"}を行いました。`,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: `　当該投稿により、依頼者は精神的苦痛を被っており、貴殿に対し、損害賠償として金${values.amount || "[金額]"}円の支払いを求めます。`,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: "　本書面到達後14日以内にご連絡がない場合は、法的手続きに移行する所存です。",
                size: 24,
              }),
            ],
          }),
          new Paragraph({ spacing: { after: 200 }, children: [] }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: "以上", size: 24 }),
            ],
          }),
        ],
      },
    ],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}

export const GENERATORS: Record<
  string,
  (values: FieldValue) => Promise<Buffer>
> = {
  DELEGATION: generateDelegationDoc,
  DISCLOSURE_REQUEST: generateDisclosureRequestDoc,
  NOTICE: generateNoticeDoc,
};
