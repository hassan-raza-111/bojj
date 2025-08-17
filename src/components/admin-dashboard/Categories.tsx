import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const Categories = ({
  serviceCategories,
  setServiceCategories,
  catModal,
  setCatModal,
  editCat,
  setEditCat,
  catName,
  setCatName,
  catError,
  setCatError,
  catLoading,
  subModal,
  setSubModal,
  editSub,
  setEditSub,
  subName,
  setSubName,
  subError,
  setSubError,
  deleteModal,
  setDeleteModal,
  handleAddCategory,
  handleEditCategory,
  handleDeleteCategory,
  handleAddSub,
  handleEditSub,
  handleDeleteSub,
}: any) => (
  <Card className="mb-8 shadow-lg border-0 bg-background">
    <CardHeader className="flex flex-row items-center justify-between border-b">
      <div>
        <CardTitle className="text-xl font-bold">Categories & Services</CardTitle>
        <CardDescription>Manage main categories and subcategories.</CardDescription>
      </div>
      <Button
        size="sm"
        className="rounded-full"
        onClick={() => {
          setCatModal(true);
          setEditCat(null);
          setCatError("");
        }}
      >
        <Plus className="w-4 h-4 mr-1" /> Add Category
      </Button>
    </CardHeader>
    <CardContent className="p-0">
      <Accordion type="single" collapsible className="divide-y divide-border">
        {Object.keys(serviceCategories).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <span className="text-5xl mb-2">📂</span>
            <span className="text-lg">No categories found.</span>
          </div>
        ) : (
          Object.entries(serviceCategories).map(([cat, subs]: [string, string[]]) => (
            <AccordionItem key={cat} value={cat}>
              <AccordionTrigger className="px-6 bg-muted/50 hover:bg-muted transition rounded-t-lg">
                <span className="font-medium text-lg">{cat}</span>
                <div className="flex gap-2 ml-auto">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="hover:bg-primary/10"
                    onClick={e => {
                      e.stopPropagation();
                      setEditCat(cat);
                      setCatName(cat);
                      setCatModal(true);
                      setCatError("");
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="hover:bg-destructive/80"
                    onClick={e => {
                      e.stopPropagation();
                      setDeleteModal({ type: "cat", cat });
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </AccordionTrigger>
              <AccordionContent className="bg-background px-6 pb-6">
                {subs.length === 0 ? (
                  <div className="flex flex-col items-center py-6 text-muted-foreground">
                    <span className="text-3xl mb-2">🗂️</span>
                    <span>No subcategories found.</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table className="min-w-[600px] w-full text-sm md:text-base">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Subcategory</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subs.map((sub: string) => (
                          <TableRow key={sub}>
                            <TableCell>{sub}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="hover:bg-primary/10"
                                  onClick={() => {
                                    setEditSub({ cat, sub });
                                    setSubName(sub);
                                    setSubModal(true);
                                    setSubError("");
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="destructive"
                                  className="hover:bg-destructive/80"
                                  onClick={() => setDeleteModal({ type: "sub", cat, sub })}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                {/* Add Subcategory Button */}
                <div className="flex justify-end mt-4">
                  <Button
                    size="sm"
                    className="rounded-full"
                    variant="secondary"
                    onClick={() => {
                      setEditSub({ cat, sub: "" });
                      setSubName("");
                      setSubModal(true);
                      setSubError("");
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Subcategory
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))
        )}
      </Accordion>
    </CardContent>
    {/* Category Modal */}
    <Dialog open={catModal} onOpenChange={setCatModal}>
      <DialogContent className="max-w-full w-full sm:max-w-lg p-4 sm:p-6 rounded-lg bg-background">
        <DialogHeader>
          <DialogTitle>{editCat ? "Edit Category" : "Add Category"}</DialogTitle>
          <DialogDescription>
            {editCat ? "Edit the category name below." : "Enter a new category name."}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={e => {
            e.preventDefault();
            editCat ? handleEditCategory() : handleAddCategory();
          }}
          className="space-y-4"
        >
          <Input
            value={catName}
            onChange={e => setCatName(e.target.value)}
            placeholder="Category name"
            className="mb-2"
            autoFocus
          />
          {catError && <div className="text-destructive text-xs mb-2">{catError}</div>}
          <DialogFooter>
            <Button type="submit" disabled={catLoading} className="w-full">
              {catLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin w-4 h-4" /> Saving...
                </span>
              ) : editCat ? (
                "Save Changes"
              ) : (
                "Add Category"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    {/* Subcategory Modal */}
    <Dialog open={subModal} onOpenChange={setSubModal}>
      <DialogContent className="max-w-full w-full sm:max-w-lg p-4 sm:p-6 rounded-lg bg-background">
        <DialogHeader>
          <DialogTitle>{editSub && editSub.sub ? "Edit Subcategory" : "Add Subcategory"}</DialogTitle>
          <DialogDescription>
            {editSub && editSub.sub ? "Edit the subcategory name below." : "Enter a new subcategory name."}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={e => {
            e.preventDefault();
            editSub && editSub.sub ? handleEditSub() : handleAddSub(editSub?.cat || "");
          }}
          className="space-y-4"
        >
          <Input
            value={subName}
            onChange={e => setSubName(e.target.value)}
            placeholder="Subcategory name"
            className="mb-2"
            autoFocus
          />
          {subError && <div className="text-destructive text-xs mb-2">{subError}</div>}
          <DialogFooter>
            <Button type="submit" disabled={catLoading} className="w-full">
              {catLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin w-4 h-4" /> Saving...
                </span>
              ) : editSub && editSub.sub ? (
                "Save Changes"
              ) : (
                "Add Subcategory"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    {/* Delete Confirmation Modal */}
    <Dialog open={!!deleteModal} onOpenChange={() => setDeleteModal(null)}>
      <DialogContent className="max-w-full w-full sm:max-w-lg p-4 sm:p-6 rounded-lg bg-background">
        <DialogHeader>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this {deleteModal?.type === "cat" ? "category" : "subcategory"}?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="destructive"
            onClick={() => {
              if (!deleteModal) return;
              if (deleteModal.type === "cat") {
                handleDeleteCategory(deleteModal.cat);
              } else if (deleteModal.type === "sub" && deleteModal.sub) {
                handleDeleteSub(deleteModal.cat, deleteModal.sub);
              }
            }}
            disabled={catLoading}
            className="w-full"
          >
            {catLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin w-4 h-4" /> Deleting...
              </span>
            ) : (
              "Delete"
            )}
          </Button>
          <Button variant="outline" onClick={() => setDeleteModal(null)} disabled={catLoading} className="w-full">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </Card>
);

export default Categories; 