import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { FolderIcon } from "lucide-react";

const Project = () => {
  return (
    <Empty className="bg-border h-120">
      <EmptyHeader>
        <EmptyMedia
          variant="icon"
          className="p-1 border-2 border-current/50 rounded-md"
        >
          <FolderIcon className="h-12 w-12 text-muted-foreground" />
        </EmptyMedia>
        <EmptyTitle>No Projects Found</EmptyTitle>
        <EmptyDescription>
          There are currently no projects to display.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="text-secondary">
        Get started by creating a new project.
      </EmptyContent>
    </Empty>
  );
};

export default Project;
