import { QueryClient } from '@tanstack/react-query';
import { cache } from 'react';

// cache() is a React 18 feature that allows you to cache a function result
// across server components for the duration of a single request.
const getQueryClient = cache(() => new QueryClient());
export default getQueryClient;