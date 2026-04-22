import { MapEditor } from '@/features/editor/components/MapEditor';

const mockNodes = [
  { id: '1', label: 'AI活用', memo: 'AIを業務に活用するための戦略を整理する。自然言語処理、画像認識、自動化の3軸で検討。', positionX: 400, positionY: 300 },
  { id: '2', label: '自然言語処理', memo: 'チャットボット、文書要約、翻訳の活用を検討', positionX: 200, positionY: 150 },
  { id: '3', label: '画像認識', memo: '', positionX: 600, positionY: 150 },
  { id: '4', label: '自動化', memo: 'RPA連携、ワークフロー自動化', positionX: 400, positionY: 100 },
  { id: '5', label: 'チャットボット', memo: '', positionX: 50, positionY: 0 },
  { id: '6', label: '文書要約', memo: '社内文書の自動要約で情報アクセスを改善', positionX: 200, positionY: 0 },
  { id: '7', label: '品質検査', memo: '', positionX: 600, positionY: 0 },
  { id: '8', label: 'データ分析', memo: '', positionX: 400, positionY: 450 },
];

const mockEdges = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e1-3', source: '1', target: '3' },
  { id: 'e1-4', source: '1', target: '4' },
  { id: 'e2-5', source: '2', target: '5' },
  { id: 'e2-6', source: '2', target: '6' },
  { id: 'e3-7', source: '3', target: '7' },
  { id: 'e1-8', source: '1', target: '8' },
];

const mockMap = { id: '1', title: 'AI活用アイデア集' };

export default function MapEditorPage() {
  return (
    <MapEditor
      initialNodes={mockNodes}
      initialEdges={mockEdges}
      mapTitle={mockMap.title}
    />
  );
}
