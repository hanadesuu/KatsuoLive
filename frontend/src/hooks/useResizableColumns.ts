import { useEffect, useRef, useState } from 'react';

interface ColumnWidths {
  [key: string]: number;
}

export function useResizableColumns(initialWidths: ColumnWidths) {
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>(initialWidths);
  const tableRef = useRef<HTMLTableElement>(null);
  const activeColumnRef = useRef<string | null>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!activeColumnRef.current) return;

      const diff = e.clientX - startXRef.current;
      const newWidth = Math.max(50, startWidthRef.current + diff);

      setColumnWidths(prev => ({
        ...prev,
        [activeColumnRef.current!]: newWidth,
      }));
    };

    const handleMouseUp = () => {
      activeColumnRef.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    if (activeColumnRef.current) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activeColumnRef.current]);

  const createResizeHandle = (columnKey: string) => {
    return (e: React.MouseEvent) => {
      e.preventDefault();
      activeColumnRef.current = columnKey;
      startXRef.current = e.clientX;
      startWidthRef.current = columnWidths[columnKey];
    };
  };

  return {
    columnWidths,
    tableRef,
    createResizeHandle,
  };
}
