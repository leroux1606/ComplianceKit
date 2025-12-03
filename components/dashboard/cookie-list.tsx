"use client";

import { useState } from "react";
import { Cookie, Filter } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/utils";

interface CookieData {
  id: string;
  name: string;
  domain: string;
  path: string;
  secure: boolean;
  httpOnly: boolean;
  sameSite: string | null;
  expires: Date | null;
  category: string | null;
  description: string | null;
}

interface CookieListProps {
  cookies: CookieData[];
}

const categoryColors: Record<string, string> = {
  necessary: "bg-green-500/10 text-green-600 border-green-500/20",
  analytics: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  marketing: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  functional: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  unknown: "bg-gray-500/10 text-gray-600 border-gray-500/20",
};

export function CookieList({ cookies }: CookieListProps) {
  const [filter, setFilter] = useState<string[]>([]);

  const categories = [...new Set(cookies.map((c) => c.category || "unknown"))];

  const filteredCookies =
    filter.length === 0
      ? cookies
      : cookies.filter((c) => filter.includes(c.category || "unknown"));

  if (cookies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Cookie className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No Cookies Detected</h3>
        <p className="text-sm text-muted-foreground">
          This website doesn&apos;t appear to set any cookies.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredCookies.length} of {cookies.length} cookies
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
              {filter.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {filter.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {categories.map((category) => (
              <DropdownMenuCheckboxItem
                key={category}
                checked={filter.includes(category)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setFilter([...filter, category]);
                  } else {
                    setFilter(filter.filter((f) => f !== category));
                  }
                }}
              >
                <span className="capitalize">{category}</span>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Domain</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Secure</TableHead>
              <TableHead>Expires</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCookies.map((cookie) => (
              <TableRow key={cookie.id}>
                <TableCell className="font-medium">
                  <div>
                    <p>{cookie.name}</p>
                    {cookie.description && (
                      <p className="text-xs text-muted-foreground">
                        {cookie.description}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {cookie.domain}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={categoryColors[cookie.category || "unknown"]}
                  >
                    {cookie.category || "unknown"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {cookie.secure ? (
                    <Badge variant="outline" className="bg-green-500/10 text-green-600">
                      Yes
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-500/10 text-red-600">
                      No
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {cookie.expires ? formatDate(cookie.expires) : "Session"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}



