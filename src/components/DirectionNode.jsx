import { Handle, Position } from '@xyflow/react';

function DirectionNode({ data, selected }) {
  return (
    <div
      style={{
        position: 'relative',
        padding: 16,
        background: '#fff',
        border: selected ? '2px solid #FF5252' : '2px solid #999',
        borderRadius: 4,
        minWidth: 80,
        minHeight: 40,
        textAlign: 'center',
        fontWeight: 500,
      }}
    >
      {/* 상단 핸들 (id="top") */}
      <Handle type="source" position={Position.Top} id="top" style={{ background: '#222' }} />
      <Handle type="target" position={Position.Top} id="top" style={{ background: '#222' }} />
      {/* 하단 핸들 (id="bottom") */}
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ background: '#222' }} />
      <Handle type="target" position={Position.Bottom} id="bottom" style={{ background: '#222' }} />
      <div>{data.label}</div>
    </div>
  );
}

export default DirectionNode; 