import { useEffect } from 'react';

const isNode =
  typeof process !== 'undefined' &&
  process.versions != null &&
  process.versions.node != null;

export const isBrowser = () => {
  if (process.env.NODE_ENV === 'TEST') {
    return true;
  }
  return (
    typeof window !== 'undefined' &&
    typeof window.document !== 'undefined' &&
    !isNode
  );
};

function useDocumentTitle(
  titleInfo: {
    title: string;
    pageName: string;
  },
  appDefaultTitle: string | false,
) {
  const titleText =
    typeof titleInfo.pageName === 'string' ? titleInfo.title : appDefaultTitle;
  useEffect(() => {
    if (isBrowser() && titleText) {
      document.title = titleText;
    }
  }, [titleInfo.title]);
}

export default useDocumentTitle;
