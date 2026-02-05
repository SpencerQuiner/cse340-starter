document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#editInventory")
    if (!form) return

    const updateBtn = document.querySelector("button")

    form.addEventListener("change", function () {
      updateBtn.removeAttribute("disabled")
    })
})