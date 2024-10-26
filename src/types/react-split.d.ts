declare module 'react-split' {
  import { ComponentProps, FC } from 'react';

  interface SplitProps extends ComponentProps<'div'> {
    sizes?: number[];
    minSize?: number | number[];
    expandToMin?: boolean;
    gutterSize?: number;
    gutterAlign?: string;
    snapOffset?: number;
    dragInterval?: number;
    direction?: 'horizontal' | 'vertical';
    cursor?: string;
    gutter?: (index: number, direction: string) => HTMLElement;
    elementStyle?: (dimension: number, size: number, gutterSize: number) => Object;
    gutterStyle?: (dimension: number, gutterSize: number) => Object;
    onDrag?: (sizes: number[]) => void;
    onDragStart?: (sizes: number[]) => void;
    onDragEnd?: (sizes: number[]) => void;
  }

  const Split: FC<SplitProps>;
  export default Split;
}