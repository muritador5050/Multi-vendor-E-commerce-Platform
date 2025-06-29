// Example usage of all auth hooks in React components

import React from 'react';
import { Navigate } from 'react-router-dom';
import {
  useCurrentUser,
  useIsAuthenticated,
  useCanCreate,
  useCanEdit,
  useCanDelete,
  useCanRead,
  useIsAdmin,
  useIsVendor,
  useUserPermissions,
  usePermission,
} from '@/context/AuthContext';
import { ACTIONS } from '@/type/auth';

// 1. useCurrentUser - Get current user data
function UserProfile() {
  const user = useCurrentUser();

  if (!user) {
    return <div>Please log in to view your profile</div>;
  }

  return (
    <div className='user-profile'>
      <h2>Welcome, {user.name}!</h2>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
      <p>Email Verified: {user.emailVerified ? 'Yes' : 'No'}</p>
    </div>
  );
}

// 2. useIsAuthenticated - Check if user is logged in
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  return <>{children}</>;
}

// 3. useCanCreate - Check create permissions
function CreateProductButton() {
  const canCreate = useCanCreate();

  if (!canCreate) {
    return null; // Don't show button if user can't create
  }

  return (
    <button className='btn-primary' onClick={handleCreateProduct}>
      Create New Product
    </button>
  );
}

function handleCreateProduct() {
  // Handle product creation
  console.log('Creating product...');
}

// 4. useCanEdit - Check edit permissions
function EditButton({ productId }: { productId: string }) {
  const canEdit = useCanEdit();

  return (
    <button
      disabled={!canEdit}
      className={canEdit ? 'btn-secondary' : 'btn-disabled'}
      onClick={() => canEdit && handleEdit(productId)}
    >
      {canEdit ? 'Edit' : 'No Edit Permission'}
    </button>
  );
}

function handleEdit(productId: string) {
  console.log('Editing product:', productId);
}

// 5. useCanDelete - Check delete permissions
function DeleteButton({ itemId }: { itemId: string }) {
  const canDelete = useCanDelete();

  if (!canDelete) {
    return <span className='text-gray-400'>Delete not allowed</span>;
  }

  return (
    <button className='btn-danger' onClick={() => handleDelete(itemId)}>
      Delete
    </button>
  );
}

function handleDelete(itemId: string) {
  if (window.confirm('Are you sure you want to delete this item?')) {
    console.log('Deleting item:', itemId);
  }
}

// 6. useCanRead - Check read permissions (rare, but useful for sensitive data)
function SensitiveData() {
  const canRead = useCanRead();

  if (!canRead) {
    return <div>You don't have permission to view this data</div>;
  }

  return (
    <div>
      <h3>Sensitive Information</h3>
      <p>This data is only visible to authorized users</p>
    </div>
  );
}

// 7. useIsAdmin - Admin-only features
function AdminPanel() {
  const isAdmin = useIsAdmin();

  if (!isAdmin) {
    return <div>Access denied. Admin privileges required.</div>;
  }

  return (
    <div className='admin-panel'>
      <h2>Admin Dashboard</h2>
      <button>Manage Users</button>
      <button>System Settings</button>
      <button>View Analytics</button>
    </div>
  );
}

// 8. useIsVendor - Vendor-specific features
function VendorDashboard() {
  const isVendor = useIsVendor();

  if (!isVendor) {
    return <Navigate to='/' replace />;
  }

  return (
    <div className='vendor-dashboard'>
      <h2>Vendor Dashboard</h2>
      <div>
        <button>My Products</button>
        <button>Sales Analytics</button>
        <button>Inventory Management</button>
      </div>
    </div>
  );
}

// 9. useUserPermissions - Display all user permissions
function PermissionsDisplay() {
  const permissions = useUserPermissions();

  return (
    <div className='permissions-list'>
      <h3>Your Permissions:</h3>
      <ul>
        {permissions.map((permission) => (
          <li key={permission} className='permission-item'>
            ✓ Can {permission}
          </li>
        ))}
      </ul>
    </div>
  );
}

// 10. usePermission - Check specific action permissions
function ActionBasedComponent() {
  const canCreate = usePermission(ACTIONS.CREATE);
  const canEdit = usePermission(ACTIONS.EDIT);
  const canDelete = usePermission(ACTIONS.DELETE);

  return (
    <div className='action-buttons'>
      {canCreate && <button className='btn-success'>Create Item</button>}
      {canEdit && <button className='btn-warning'>Edit Item</button>}
      {canDelete && <button className='btn-danger'>Delete Item</button>}
    </div>
  );
}

// Combined example - Product Card with role-based features
function ProductCard({ product }: { product: any }) {
  const user = useCurrentUser();
  const isVendor = useIsVendor();
  const isAdmin = useIsAdmin();
  const canEdit = useCanEdit();
  const canDelete = useCanDelete();

  return (
    <div className='product-card'>
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <p className='price'>${product.price}</p>

      {/* Show owner info to vendors and admins */}
      {(isVendor || isAdmin) && (
        <p className='owner'>Owner: {product.vendorName}</p>
      )}

      {/* Show edit button if user can edit AND owns the product OR is admin */}
      {canEdit && (user?.id === product.vendorId || isAdmin) && (
        <button onClick={() => handleEdit(product.id)}>Edit Product</button>
      )}

      {/* Show delete button with same logic */}
      {canDelete && (user?.id === product.vendorId || isAdmin) && (
        <button onClick={() => handleDelete(product.id)}>Delete Product</button>
      )}

      {/* Always show buy button for customers */}
      <button className='btn-primary'>Add to Cart</button>
    </div>
  );
}

// Navigation component with role-based menu items
function Navigation() {
  const isAuthenticated = useIsAuthenticated();
  const isAdmin = useIsAdmin();
  const isVendor = useIsVendor();
  const user = useCurrentUser();

  return (
    <nav className='navigation'>
      <div className='nav-brand'>My Shop</div>

      <ul className='nav-menu'>
        <li>
          <a href='/'>Home</a>
        </li>
        <li>
          <a href='/products'>Products</a>
        </li>

        {isAuthenticated && (
          <>
            <li>
              <a href='/profile'>Profile</a>
            </li>

            {isVendor && (
              <>
                <li>
                  <a href='/vendor/dashboard'>My Dashboard</a>
                </li>
                <li>
                  <a href='/vendor/products'>My Products</a>
                </li>
              </>
            )}

            {isAdmin && (
              <>
                <li>
                  <a href='/admin'>Admin Panel</a>
                </li>
                <li>
                  <a href='/admin/users'>Manage Users</a>
                </li>
              </>
            )}
          </>
        )}
      </ul>

      <div className='nav-user'>
        {isAuthenticated ? (
          <div>
            Welcome, {user?.name}
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <div>
            <a href='/login'>Login</a>
            <a href='/register'>Register</a>
          </div>
        )}
      </div>
    </nav>
  );
}

function handleLogout() {
  // Handle logout logic
  console.log('Logging out...');
}

// Form component with permission-based field access
function UserEditForm({ targetUser }: { targetUser: any }) {
  const isAdmin = useIsAdmin();
  const currentUser = useCurrentUser();
  const canEdit = useCanEdit();

  // Only admin or the user themselves can edit
  const canEditThisUser = isAdmin || currentUser?.id === targetUser.id;

  if (!canEdit || !canEditThisUser) {
    return <div>You don't have permission to edit this user</div>;
  }

  return (
    <form className='user-edit-form'>
      <input type='text' defaultValue={targetUser.name} placeholder='Name' />
      <input type='email' defaultValue={targetUser.email} placeholder='Email' />

      {/* Only admin can change roles */}
      {isAdmin && (
        <select defaultValue={targetUser.role}>
          <option value='customer'>Customer</option>
          <option value='vendor'>Vendor</option>
          <option value='admin'>Admin</option>
        </select>
      )}

      <button type='submit'>Save Changes</button>
    </form>
  );
}

export {
  UserProfile,
  ProtectedRoute,
  CreateProductButton,
  EditButton,
  DeleteButton,
  AdminPanel,
  VendorDashboard,
  PermissionsDisplay,
  ActionBasedComponent,
  ProductCard,
  Navigation,
  UserEditForm,
};
