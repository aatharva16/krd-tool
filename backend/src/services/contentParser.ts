import {
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  HeadingLevel,
  WidthType,
  ShadingType,
} from 'docx'

type DocxNode = Paragraph | Table

// ---------------------------------------------------------------------------
// Inline markdown → TextRun[]
// Handles **bold** only; everything else is plain text.
// ---------------------------------------------------------------------------
function parseInlineRuns(text: string): TextRun[] {
  const parts = text.split('**')
  return parts
    .filter((_, i) => i === 0 || parts[i - 1] !== undefined)
    .map((part, i) => new TextRun({ text: part, bold: i % 2 === 1 }))
}

// ---------------------------------------------------------------------------
// Pipe table lines → Table node
// Expects lines like: | Col | Col |
// Skips separator rows (|---|---|)
// First non-separator row is treated as the header.
// ---------------------------------------------------------------------------
function buildTable(lines: string[]): Table {
  const dataLines = lines.filter((l) => !/^\|[-\s|:]+\|?$/.test(l))

  const rows = dataLines.map((line, rowIndex) => {
    const isHeader = rowIndex === 0
    const cells = line
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((c) => c.trim())

    return new TableRow({
      tableHeader: isHeader,
      children: cells.map(
        (cell) =>
          new TableCell({
            children: [new Paragraph({ children: parseInlineRuns(cell) })],
            shading: isHeader
              ? { type: ShadingType.SOLID, color: 'E5E7EB', fill: 'E5E7EB' }
              : undefined,
          }),
      ),
    })
  })

  return new Table({
    rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
  })
}

// ---------------------------------------------------------------------------
// Main parser
// Input: raw section content string (LLM output stored in DB)
// Output: array of Paragraph and Table nodes ready for a docx Document
// ---------------------------------------------------------------------------
export function parseContentToDocx(content: string): DocxNode[] {
  const lines = content.split('\n')
  const nodes: DocxNode[] = []
  let tableBuffer: string[] = []

  function flushTable() {
    if (tableBuffer.length === 0) return
    nodes.push(buildTable(tableBuffer))
    tableBuffer = []
  }

  for (const raw of lines) {
    const line = raw.trimEnd()

    // Accumulate table rows
    if (line.trimStart().startsWith('|')) {
      tableBuffer.push(line.trim())
      continue
    }

    // Non-table line: flush any buffered table first
    flushTable()

    const trimmed = line.trim()
    if (!trimmed) continue

    if (trimmed.startsWith('### ')) {
      nodes.push(
        new Paragraph({
          children: parseInlineRuns(trimmed.slice(4)),
          heading: HeadingLevel.HEADING_3,
        }),
      )
    } else if (trimmed.startsWith('## ')) {
      nodes.push(
        new Paragraph({
          children: parseInlineRuns(trimmed.slice(3)),
          heading: HeadingLevel.HEADING_2,
        }),
      )
    } else if (trimmed.startsWith('- ')) {
      nodes.push(
        new Paragraph({
          children: parseInlineRuns(trimmed.slice(2)),
          bullet: { level: 0 },
        }),
      )
    } else {
      nodes.push(new Paragraph({ children: parseInlineRuns(trimmed) }))
    }
  }

  flushTable()
  return nodes
}
