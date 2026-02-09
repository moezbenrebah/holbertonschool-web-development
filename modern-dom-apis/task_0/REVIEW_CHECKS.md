# Task 0 - Manual Review Checks

## Check the initial/default state:

- The todo list (`#todo-list`) is empty (no `<li>` elements inside)
- The total count (`#total-count`) displays `0`
- The completed count (`#completed-count`) displays `0`
- The input field (`#todo-input`) is empty and has placeholder text "What needs to be done?"
- The "Add" button is visible and clickable

## Check adding a todo:

- Type "Buy groceries" in the input field and click "Add" (or press Enter)
- A new todo item appears in the list with the text "Buy groceries"
- The todo item contains a checkbox (unchecked), the text, and a "Delete" button
- The input field is cleared after submission
- The input field regains focus after submission
- The total count updates to `1`
- The completed count remains `0`
- Add another todo "Walk the dog" - total count updates to `2`

## Check empty input validation:

- Clear the input field and try to submit (click "Add" or press Enter)
- No new todo item is added to the list
- The total count remains unchanged

## Check whitespace-only input validation:

- Type only spaces "   " in the input field and try to submit
- No new todo item is added to the list
- The total count remains unchanged

## Check toggling todo completion:

- Click the checkbox of the first todo item
- The checkbox becomes checked
- The todo item gets the `completed` class added
- The todo text gets a line-through style (strikethrough)
- The completed count updates to `1`
- The total count remains unchanged
- Click the checkbox again to uncheck it
- The `completed` class is removed
- The strikethrough style is removed
- The completed count updates back to `0`

## Check deleting a todo:

- Click the "Delete" button on a todo item
- The todo item is removed from the list
- The total count decreases by `1`
- If the deleted todo was completed, the completed count also decreases by `1`

## Check stats accuracy with multiple todos:

- Add 3 todos: "Task A", "Task B", "Task C"
- Total count shows `3`, completed count shows `0`
- Mark "Task A" and "Task C" as completed
- Total count shows `3`, completed count shows `2`
- Delete "Task B" (uncompleted)
- Total count shows `2`, completed count shows `2`
- Delete "Task A" (completed)
- Total count shows `1`, completed count shows `1`

## Check DOM element structure of a todo item:

- Add a todo and inspect the created `<li>` element
- The `<li>` has class `todo-item`
- Inside the `<li>`, there are exactly 3 children in order:
  1. An `<input>` with `type="checkbox"` and class `todo-checkbox`
  2. A `<span>` with class `todo-text` containing the todo text
  3. A `<button>` with class `btn-delete` and text "Delete"

## Check that page does not reload on form submission:

- Open the browser's Network tab in DevTools
- Add a new todo
- Verify no page reload occurs (no new document request in Network tab)
- The form submission is handled via JavaScript with `event.preventDefault()`
