import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@dockyard/ui", "@dockyard/hooks", "@dockyard/store", "@dockyard/api", "@dockyard/utils"],
};

export default nextConfig;
