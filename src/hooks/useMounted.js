import { useCallback, useEffect, useRef } from "react";
// orhan abiye sor. bu hook neye yarıyor useIsInit ile farkı ney

const useMounted = () => {
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  return useCallback(() => mounted.current, []); // orhan abiye sor. mounted.current function değil. buradaki işlem ne
};

export default useMounted;
