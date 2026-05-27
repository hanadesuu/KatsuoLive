'use client';

import { type TableHTMLAttributes, useEffect, useRef, useState } from 'react';

interface ResizableTableProps extends TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

export function ResizableTable({ children, className = '', ...tableProps }: ResizableTableProps) {
  const tableRef = useRef<HTMLTableElement>(null);
  const [resizing, setResizing] = useState<{
    th: HTMLTableHeaderCellElement;
    startX: number;
    startWidth: number;
  } | null>(null);

  useEffect(() => {
    const table = tableRef.current;
    if (!table) return;

    // 为所有表头添加调整大小的句柄
    const ths = table.querySelectorAll('thead th');
    
    ths.forEach((th) => {
      const element = th as HTMLTableHeaderCellElement;
      
      // 移除之前的句柄（如果有）
      const existingHandle = element.querySelector('.resize-handle');
      if (existingHandle) {
        existingHandle.remove();
      }

      // 移除初始的 minWidth 和 maxWidth 限制，让拖动完全控制宽度
      // 但保存当前宽度作为初始宽度
      if (!element.style.width) {
        const currentWidth = element.offsetWidth;
        element.style.width = `${currentWidth}px`;
      }

      // 创建调整大小的句柄
      const resizeHandle = document.createElement('div');
      resizeHandle.className = 'resize-handle';
      resizeHandle.style.cssText = `
        position: absolute;
        top: 0;
        right: 0;
        width: 8px;
        height: 100%;
        cursor: col-resize;
        z-index: 10;
        background: transparent;
        transition: background 0.2s;
      `;

      // 添加悬停效果
      resizeHandle.addEventListener('mouseenter', () => {
        resizeHandle.style.background = 'rgba(59, 130, 246, 0.3)';
      });
      resizeHandle.addEventListener('mouseleave', () => {
        if (!resizing) {
          resizeHandle.style.background = 'transparent';
        }
      });

      // 鼠标按下开始调整
      resizeHandle.addEventListener('mousedown', (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        const startX = e.clientX;
        const startWidth = element.offsetWidth;
        
        setResizing({ th: element, startX, startWidth });
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
      });

      // 设置 th 为相对定位以便句柄绝对定位
      element.style.position = 'relative';
      element.appendChild(resizeHandle);
    });
  }, []);

  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizing) return;

      const diff = e.clientX - resizing.startX;
      const newWidth = Math.max(30, resizing.startWidth + diff); // 降低最小宽度到30px
      
      // 强制设置宽度，覆盖任何 minWidth/maxWidth 限制
      resizing.th.style.width = `${newWidth}px`;
      resizing.th.style.minWidth = `${newWidth}px`;
      resizing.th.style.maxWidth = `${newWidth}px`;
    };

    const handleMouseUp = () => {
      setResizing(null);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      
      // 恢复透明背景
      const handles = tableRef.current?.querySelectorAll('.resize-handle');
      handles?.forEach((handle) => {
        (handle as HTMLElement).style.background = 'transparent';
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing]);

  return (
    <table ref={tableRef} className={className} {...tableProps}>
      {children}
    </table>
  );
}
