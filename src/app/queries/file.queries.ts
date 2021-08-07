import gql from 'graphql-tag';

const FileQueries = {
  UPDATE: gql`
    mutation update_file_mutation(
      $file_id: Int!
      $_set: file_set_input = {}
      $_inc: file_inc_input = {}
    ) {
      update_file(where: { id: { _eq: $file_id } }, _set: $_set, _inc: $_inc) {
        affected_rows
        returning {
          id
        }
      }
    }
  `,
};

export default FileQueries;
