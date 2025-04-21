export const fetchBlogList = async () => {
    try {
      const response = await fetch("/api/db/posts?columns=id,title,slug,excerpt");
      if (!response.ok) throw new Error("Failed to fetch blog list");
      const data = await response.json();
      // console.log(data);
      return data;
    } catch (error) {
      console.error("❌ Error fetching blog list:", error);
      return [];
    }
  };
  
  export const fetchBlogPost = async (slug) => {
    try {
      const response = await fetch(`/api/db/posts?columns=id,title,content_md,created_at&slug=${slug}`);
      if (!response.ok) throw new Error("Post not found");
  
      const data = await response.json();
      return data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error("❌ Error fetching blog post:", error);
      return null;
    }
  };
  
  export const fetchLatestBlog = async () => {
    try {
        const response = await fetch("/api/db/posts?columns=id,title,slug,excerpt&order_by=created_at&order=desc&limit=1");
        
        if (!response.ok) throw new Error("Failed to fetch latest blog post");
    
        const data = await response.json();
        const latestBlog = data[0];
        
        return latestBlog;
    } catch (error) {
        console.error("❌ Error fetching latest blog post:", error);
        return null;
    }
};
