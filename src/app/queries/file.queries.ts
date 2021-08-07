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

  ADD: gql`
    mutation insert_file($objects: [file_insert_input!]!) {
      insert_file(objects: $objects) {
        affected_rows
        returning {
          id
          flow_id
          name
          type
        }
      }
    }
  `,
};

export default FileQueries;
