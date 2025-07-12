import {
  useCanCreate,
  useCanEdit,
  useCanDelete,
  useCanRead,
} from '@/context/AuthContextService';
import { Box, Button } from '@chakra-ui/react';

export function ResourceActions() {
  const canCreate = useCanCreate();
  const canEdit = useCanEdit();
  const canDelete = useCanDelete();
  const canRead = useCanRead();

  return (
    <Box>
      {canCreate && <Button>Create New</Button>}
      {canEdit && <Button>Edit</Button>}
      {canDelete && <Button>Delete</Button>}
      {canRead && <Button>View Details</Button>}
    </Box>
  );
}
