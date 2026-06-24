import { useQuery } from "@tanstack/react-query";

/**
 * Hook chung để Fetch dữ liệu có hỗ trợ Caching chống lặp API
 * @param {Array} queryKey - Mảng định danh duy nhất cho API này (BẮT BUỘC)
 * @param {Function} service - Hàm gọi API (axios/fetch)
 * @param {Boolean} condition - Điều kiện kích hoạt gọi API (Mặc định: true)
 * @param {Number} staleTime - Thời gian giữ data "sạch" không gọi lại API (Mặc định: 5 phút)
 */
const useAsync = ({ queryKey, service, condition = true, staleTime = 1000 * 60 * 5 }) => {
  const { data, refetch, isLoading, isFetching } = useQuery({
    queryKey: queryKey, 
    queryFn: async () => {
      if (typeof service !== "function") return null;
      const result = await service();
      return result?.content || result?.data?.content || result?.data || [];
    },
    enabled: condition,
    staleTime: staleTime,
    refetchOnWindowFocus: false, 
  });

  return { 
    state: data, 
    refetch, 
    isLoading, 
    isFetching 
  };
};

export default useAsync;