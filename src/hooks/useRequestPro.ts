import { useRequest } from 'ahooks';
import { Options, Service } from 'ahooks/lib/useRequest/src/types';

function useRequestPro<TData, TParams extends any[]>(
  service: Service<TData, TParams>,
  options?: Options<TData, TParams> & { ready?: boolean },
) {
  if (options?.ready) return;

  return useRequest(service, options);
}

export default useRequestPro;
