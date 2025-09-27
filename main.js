import PropTypes from "prop-types";

// User type
export const UserPropType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  created_at: PropTypes.string.isRequired,
});

// Checklist Item type
export const ChecklistItemPropType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  nc_check_point: PropTypes.string.isRequired,
  verified_by: PropTypes.string.isRequired,
  evidence: PropTypes.string.isRequired,
  file_path: PropTypes.string,
  file_name: PropTypes.string,
  file_type: PropTypes.string,
  created_at: PropTypes.string.isRequired,
  updated_at: PropTypes.string.isRequired,
  user_id: PropTypes.string.isRequired,
});

// File Upload type
export const FileUploadPropType = PropTypes.shape({
  file: PropTypes.instanceOf(File).isRequired,
  preview: PropTypes.string,
});

// Example usage in a React component
function UserCard({ user }) {
  return (
    <div>
      <h3>{user.username}</h3>
      <p>Email: {user.email}</p>
      <small>Joined: {user.created_at}</small>
    </div>
  );
}

UserCard.propTypes = {
  user: UserPropType.isRequired,
};

export default UserCard;
