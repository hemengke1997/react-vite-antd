import React, { useCallback, useEffect } from 'react';
import ResizableHeader, { ComponentProp } from './ResizableHeader';
import { option } from './config';
import { isEmpty } from 'lodash';
import { useDebounceFn, useThrottleEffect } from 'ahooks';

type useTableResizableHeaderProps<ColumnType> = {
  columns: ColumnType[] | undefined;
  /** @description 最后一列不能拖动，设置最后一列的最小展示宽度，默认120 */
  defaultWidth?: number;
  /** @description 拖动最小宽度 默认120 */
  minConstraints?: number;
  /** @description 拖动最大宽度 默认无穷 */
  maxConstraints?: number;
};

type CacheType = { width: number; index: number };

const WIDTH = 120;

const getKey = 'dataIndex';

export const ResizableUniqIdPrefix = 'resizable-table-id-';

function depthFirstSearch<T extends Record<string, any> & { children?: T[] }>(
  children: T[],
  condition: (column: T) => boolean,
  width: number,
) {
  const c = [...children];

  (function find(cls: T[] | undefined) {
    if (!cls) return;
    for (let i = 0; i < cls?.length; i++) {
      if (condition(cls[i])) {
        cls[i] = {
          ...cls[i],
          width,
        };
        return;
      }
      if (cls[i].children) {
        find(cls[i].children);
      }
    }
  })(c);

  return c;
}

function getUniqueId(index: number) {
  return `${ResizableUniqIdPrefix}${index}`;
}

function useTableResizableHeader<ColumnType extends Record<string, any>>(
  props: useTableResizableHeaderProps<ColumnType>,
) {
  const {
    columns,
    defaultWidth = WIDTH,
    minConstraints = WIDTH,
    maxConstraints = Infinity,
  } = props;

  // column的宽度缓存，避免render导致columns宽度重置
  const widthCache = React.useRef<Map<React.Key, CacheType>>(new Map());

  const [resizableColumns, setResizableColumns] = React.useState<ColumnType[]>(
    columns || [],
  );

  const [tableWidth, setTableWidth] = React.useState<number>();

  const [triggerRender, forceRender] = React.useReducer((s) => s + 1, 0);

  const onMount = useCallback(
    (id: string) => (width: number) => {
      if (width) {
        setResizableColumns((t) => {
          const nextColumns = depthFirstSearch(
            t,
            (col) => col[getKey] === id,
            width,
          );

          const kvMap = new Map<React.Key, CacheType>();

          function dig(cols: ColumnType[]) {
            cols.forEach((col, i) => {
              const key = col[getKey];
              kvMap.set(key, { width: col?.width, index: i });
              if (col?.children) {
                dig(col.children);
              }
            });
          }

          dig(nextColumns);

          widthCache.current = kvMap;

          return nextColumns;
        });
      }
    },
    [widthCache.current, resizableColumns],
  );

  const onResize = onMount;

  const getColumns = React.useCallback(
    (list: ColumnType[]) => {
      const trulyColumns = list?.filter((item) => !isEmpty(item));

      const c = trulyColumns.map((col, index) => {
        return {
          ...col,
          children: col?.children?.length
            ? getColumns(col.children)
            : undefined,
          onHeaderCell: (column: ColumnType) => {
            return {
              title: col?.title,
              width:
                widthCache.current?.get(column[getKey])?.width || column?.width,
              onMount: onMount(column?.[getKey]),
              onResize: onResize(column?.[getKey]),
              minWidth: minConstraints,
              maxWidth: maxConstraints,
              triggerRender,
              resizable: !(index === trulyColumns.length - 1 && col.fixed), // 最后fixed列不能拖动
            } as ComponentProp;
          },
          width: widthCache.current?.get(col[getKey])?.width || col?.width,
          [getKey]: col[getKey] || col.key || getUniqueId(index),
        };
      }) as ColumnType[];

      return c;
    },
    [onMount, onResize, widthCache.current],
  );

  useEffect(() => {
    if (columns) {
      const c = getColumns(columns);

      setResizableColumns(c);
    }
  }, [columns]);

  useThrottleEffect(
    () => {
      const t = getColumns(resizableColumns);

      setResizableColumns(t);
    },
    [triggerRender],
    option,
  );

  useEffect(() => {
    let width = 0;

    (function loop(cls: ColumnType[]) {
      for (let i = 0; i < cls.length; i++) {
        width +=
          Number(cls[i].width) ||
          columns?.[columns.length - 1].width ||
          defaultWidth;
        if (cls[i].children) {
          loop(cls[i].children);
        }
      }
    })(resizableColumns);

    setTableWidth(width);
  }, [resizableColumns]);

  const { run: debounceRender } = useDebounceFn(forceRender);

  useEffect(() => {
    window.addEventListener('resize', debounceRender);
    return () => {
      window.removeEventListener('resize', debounceRender);
    };
  }, []);

  const header = React.useMemo(() => {
    return {
      cell: ResizableHeader,
    };
  }, [ResizableHeader]);

  return {
    resizableColumns,
    header,
    tableWidth,
  };
}

export default useTableResizableHeader;
