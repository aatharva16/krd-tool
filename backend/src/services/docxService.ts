import {
  Document,
  Packer,
  Paragraph,
  Table,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from 'docx'
import type { KRDSession, KRDSection, SectionKey } from '@krd-tool/shared'
import { SECTION_KEYS } from '@krd-tool/shared'
import { parseContentToDocx } from './contentParser'

type DocxNode = Paragraph | Table

const SECTION_DISPLAY_NAMES: Record<SectionKey, string> = {
  overview: 'Overview',
  userStories: 'User Stories',
  requirements: 'Functional Requirements',
  nfr: 'Non-Functional Requirements',
  instrumentation: 'Instrumentation & Events',
  testing: 'Testing',
  openQuestions: 'Open Questions',
  signoff: 'Sign-off',
}

// ---------------------------------------------------------------------------
// Cover page
// ---------------------------------------------------------------------------
function coverPage(session: KRDSession): Paragraph[] {
  const { featureName, v0Scope, v1Scope, profileSnapshot } = session
  const exportDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const paras: Paragraph[] = [
    new Paragraph({
      children: [new TextRun({ text: featureName, bold: true, size: 56 })],
      alignment: AlignmentType.LEFT,
      spacing: { before: 720, after: 480 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Key Requirements Document', color: '6B7280', size: 28 })],
      spacing: { after: 1440 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Profile: ', bold: true }),
        new TextRun({ text: profileSnapshot.name }),
      ],
      spacing: { after: 120 },
    }),
  ]

  if (profileSnapshot.teamName) {
    paras.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Team: ', bold: true }),
          new TextRun({ text: profileSnapshot.teamName }),
        ],
        spacing: { after: 120 },
      }),
    )
  }

  paras.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'V0 Scope: ', bold: true }),
        new TextRun({ text: v0Scope || 'Not specified' }),
      ],
      spacing: { after: 120 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'V1 Scope: ', bold: true }),
        new TextRun({ text: v1Scope || 'Not specified' }),
      ],
      spacing: { after: 120 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Exported: ', bold: true }),
        new TextRun({ text: exportDate }),
      ],
      spacing: { after: 1440 },
    }),
  )

  return paras
}

// ---------------------------------------------------------------------------
// Section renderer
// ---------------------------------------------------------------------------
function renderSection(section: KRDSection): DocxNode[] {
  const title = SECTION_DISPLAY_NAMES[section.sectionKey] ?? section.sectionKey
  const nodes: DocxNode[] = []

  nodes.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_1,
      pageBreakBefore: true,
      spacing: { after: 240 },
    }),
  )

  if (!section.content || section.content.trim() === '') {
    nodes.push(
      new Paragraph({
        children: [new TextRun({ text: 'No content generated.', italics: true, color: '9CA3AF' })],
      }),
    )
    return nodes
  }

  nodes.push(...parseContentToDocx(section.content))
  return nodes
}

// ---------------------------------------------------------------------------
// Build complete document
// ---------------------------------------------------------------------------
export async function buildDocument(session: KRDSession, sections: KRDSection[]): Promise<Buffer> {
  const sectionMap = new Map<SectionKey, KRDSection>(sections.map((s) => [s.sectionKey, s]))

  const coverNodes = coverPage(session)
  const sectionNodes: DocxNode[] = []

  for (const key of SECTION_KEYS) {
    const section = sectionMap.get(key)
    if (!section) {
      // Placeholder for missing sections
      sectionNodes.push(
        new Paragraph({
          text: SECTION_DISPLAY_NAMES[key],
          heading: HeadingLevel.HEADING_1,
          pageBreakBefore: true,
          spacing: { after: 240 },
        }),
        new Paragraph({
          children: [new TextRun({ text: 'No content generated.', italics: true, color: '9CA3AF' })],
        }),
      )
    } else {
      sectionNodes.push(...renderSection(section))
    }
  }

  const doc = new Document({
    sections: [
      {
        children: [...coverNodes, ...sectionNodes],
      },
    ],
  })

  return Packer.toBuffer(doc)
}
