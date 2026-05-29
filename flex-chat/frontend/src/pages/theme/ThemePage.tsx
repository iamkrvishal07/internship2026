import { useNavigate } from 'react-router-dom';

import {
  useGetAllThemes,
} from '../../hooks/tanstackQuery/useThemeApi';
import useQueryParams from '../../hooks/useQueryParams';
import { useUpdateUrl } from '../../hooks/useUpdateUrl';
import type { Theme } from '../../types/theme';
import Loader from '../../components/common/Loader';
import ThemeDisplay from './ThemeDisplay';
import ThemeListPagination from './ThemeListPagination';
import routes from '../../constants/routes/routes';

const ThemePage = () => {
  const navigate = useNavigate();
  const changeQueryParams = useUpdateUrl();
  const currentQueryParams = useQueryParams();

  const currentPage = parseInt(currentQueryParams.page as string) || 1;
  const currentPageSize = parseInt(currentQueryParams.pageSize as string) || 10;

  const { data, isLoading: isFetching } = useGetAllThemes(currentQueryParams);

  const handlePageChange = (newPage: number) => {
    changeQueryParams('', { page: newPage, pageSize: currentPageSize });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    changeQueryParams('', { page: 1, pageSize: newPageSize });
  };

  if (isFetching) return <Loader />;

  const hasThemes = data && data.length > 0;
  const isLastPage = !!data && data.length < currentPageSize;

  return (
    <div className="min-h-screen bg-gray-50 py-8 relative">
      <div className="max-w-2xl mx-auto px-4 space-y-3">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Themes</h1>
          <button
            onClick={() => navigate(routes.themesCreate)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Create Theme
          </button>
        </div>

        {hasThemes ? (
          <>
            {data?.map((theme: Theme) => (
              <ThemeDisplay 
                key={theme.id} 
                theme={theme}
              />
            ))}

            <ThemeListPagination
              currentPage={currentPage}
              currentPageSize={currentPageSize}
              isLastPage={isLastPage}
              isLoading={false}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg
              className="w-16 h-16 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
              />
            </svg>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Themes Available</h2>
            <p className="text-gray-600 mb-6">Create your first theme to get started with customization.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThemePage;