import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

interface TipTapContent {
    type: string
    content?: any[]
    attrs?: any
    text?: string
}

interface Blog {
    id: number
    title: string
    slug: string
    coverImageUrl: string | null
    contentText: TipTapContent | string
    tags: Array<{
        id: number
        name: string
        slug: string
    }>
    author: {
        id: number
        username: string
        firstName: string | null
        lastName: string | null
        email: string
    }
    createdAt: string
    updatedAt: string
    readTime: number | null
    approvalStatus?: string
    visibility?: string
    isFeatured?: boolean
}

interface BlogsState {
    featuredBlog: Blog | null
    blogs: Blog[]
    loading: boolean
    error: string | null
    lastFetched: number | null
}

const initialState: BlogsState = {
    featuredBlog: null,
    blogs: [],
    loading: false,
    error: null,
    lastFetched: null
}

export const fetchBlogs = createAsyncThunk(
    'blogs/fetchBlogs',
    async (_, { rejectWithValue }) => {
        try {
            // Fetch all approved blogs sorted by newest first
            const response = await fetch('/api/blogs?limit=20') // Increased limit to ensure we get enough

            if (!response.ok) {
                throw new Error('Failed to fetch blogs')
            }

            const data = await response.json()
            const allBlogs: Blog[] = data.data?.blogs || []

            if (allBlogs.length === 0) {
                return { featuredBlog: null, blogs: [] }
            }

            // 1. Try to find an explicitly featured blog
            let featuredIndex = allBlogs.findIndex(b => b.isFeatured)

            // 2. Fallback: If no featured blog, use the first one (latest)
            if (featuredIndex === -1) {
                featuredIndex = 0
            }

            const featuredBlog = allBlogs[featuredIndex]

            // 3. The rest are the regular list
            // Filter out the featured one so it doesn't appear twice
            const blogs = allBlogs.filter((_, index) => index !== featuredIndex)

            return { featuredBlog, blogs }

        } catch (error: any) {
            return rejectWithValue(error.message)
        }
    }
)

const blogsSlice = createSlice({
    name: 'blogs',
    initialState,
    reducers: {
        clearBlogs: (state) => {
            state.featuredBlog = null
            state.blogs = []
            state.loading = false
            state.error = null
            state.lastFetched = null
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBlogs.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchBlogs.fulfilled, (state, action) => {
                state.loading = false
                state.featuredBlog = action.payload.featuredBlog
                state.blogs = action.payload.blogs
                state.lastFetched = Date.now()
            })
            .addCase(fetchBlogs.rejected, (state, action) => {
                state.loading = false
                // If partial failure, we might still want to show what we have, 
                // but simpler to just set error for now.
                state.error = action.payload as string
            })
    }
})

export const { clearBlogs } = blogsSlice.actions

export const selectFeaturedBlog = (state: { blogs: BlogsState }) => state.blogs.featuredBlog
export const selectBlogs = (state: { blogs: BlogsState }) => state.blogs.blogs
export const selectBlogsLoading = (state: { blogs: BlogsState }) => state.blogs.loading
export const selectBlogsError = (state: { blogs: BlogsState }) => state.blogs.error
export const selectBlogsLastFetched = (state: { blogs: BlogsState }) => state.blogs.lastFetched

export default blogsSlice.reducer
