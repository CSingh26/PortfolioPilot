import fs from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import PageHeader from '../../../components/PageHeader';

function loadMathDoc() {
  const candidates = [
    path.resolve(process.cwd(), 'docs', 'MATH.md'),
    path.resolve(process.cwd(), '..', '..', 'docs', 'MATH.md')
  ];
  const docPath = candidates.find((candidate) => fs.existsSync(candidate));
  return docPath ? fs.readFileSync(docPath, 'utf-8') : 'Math documentation not found.';
}

export default function MathPage() {
  const markdown = loadMathDoc();
  return (
    <div className="space-y-6">
      <PageHeader title="Quant Math" subtitle="Derivations" badge="MVO / Risk Parity" />
      <article className="prose prose-slate max-w-none rounded-2xl border border-border bg-white px-8 py-6 shadow-soft">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
      </article>
    </div>
  );
}
