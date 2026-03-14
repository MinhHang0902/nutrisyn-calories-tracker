"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mealAPI } from "@/lib/api";
import { Meal } from "@/types";
import { formatCalories, formatMacro } from "@/lib/utils";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { ChevronDown, ChevronUp, Search, Calendar, Trash2 } from "lucide-react";

export default function HistoryPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("all");

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const response = await mealAPI.getMeals();
        setMeals(response.data);
      } catch (error) {
        console.error("Failed to fetch meals:", error);
      }
    };
    fetchMeals();
  }, []);

  const columns: ColumnDef<Meal>[] = [
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Date
            {column.getIsSorted() === "asc" ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : (
              <ChevronDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {format(new Date(row.getValue("createdAt")), "MMM dd, yyyy HH:mm")}
        </div>
      ),
    },
    {
      accessorKey: "mealType",
      header: "Meal Type",
      cell: ({ row }) => (
        <span className="capitalize">{row.getValue("mealType")}</span>
      ),
    },
    {
      accessorKey: "foods",
      header: "Foods",
      cell: ({ row }) => {
        const foods = row.getValue("foods") as any[];
        return foods?.map((f) => f.name).join(", ") || "N/A";
      },
    },
    {
      accessorKey: "totalCalories",
      header: "Calories",
      cell: ({ row }) => formatCalories(row.getValue("totalCalories")),
    },
    {
      accessorKey: "totalProtein",
      header: "Protein",
      cell: ({ row }) => formatMacro(row.getValue("totalProtein")),
    },
    {
      accessorKey: "totalCarbs",
      header: "Carbs",
      cell: ({ row }) => formatMacro(row.getValue("totalCarbs")),
    },
    {
      accessorKey: "totalFat",
      header: "Fat",
      cell: ({ row }) => formatMacro(row.getValue("totalFat")),
    },
    {
      accessorKey: "score",
      header: "Score",
      cell: ({ row }) => {
        const score = row.getValue("score") as string;
        const colors: Record<string, string> = {
          good: "bg-green-100 text-green-800",
          moderate: "bg-yellow-100 text-yellow-800",
          exceed: "bg-red-100 text-red-800",
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${colors[score] || ""}`}>
            {score || "N/A"}
          </span>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleDelete(row.original.id)}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      ),
    },
  ];

  const handleDelete = async (id: string) => {
    try {
      await mealAPI.deleteMeal(id);
      setMeals(meals.filter((m) => m.id !== id));
    } catch (error) {
      console.error("Failed to delete meal:", error);
    }
  };

  const filteredMeals = dateFilter === "all"
    ? meals
    : meals.filter((meal) => {
        const mealDate = new Date(meal.createdAt);
        const now = new Date();
        if (dateFilter === "today") {
          return mealDate.toDateString() === now.toDateString();
        }
        if (dateFilter === "week") {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return mealDate >= weekAgo;
        }
        if (dateFilter === "month") {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return mealDate >= monthAgo;
        }
        return true;
      });

  const table = useReactTable({
    data: filteredMeals,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    state: { sorting, globalFilter },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Meal History</h1>
        <p className="text-muted-foreground">
          View and manage your meal history
        </p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search meals..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-4 py-3 text-left text-sm font-medium">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b hover:bg-muted/50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">
                    No meals found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </p>
      </div>
    </div>
  );
}
