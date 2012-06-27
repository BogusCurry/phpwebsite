var insert_text = null;
var CKEDITOR = window.parent.CKEDITOR;
var oEditor = CKEDITOR.instances.editorName;

var okListener = function(ev) {
    this._.editor.insertHtml(insert_text);
    CKEDITOR.dialog.getCurrent().removeListener("ok", okListener);
    CKEDITOR.dialog.getCurrent().removeListener("cancel", cancelListener);
}

var cancelListener = function(ev) {
    CKEDITOR.dialog.getCurrent().removeListener("ok", okListener);
    CKEDITOR.dialog.getCurrent().removeListener("cancel", cancelListener);
};

CKEDITOR.event.implementOn(CKEDITOR.dialog.getCurrent());
CKEDITOR.dialog.getCurrent().on("ok", okListener);
CKEDITOR.dialog.getCurrent().on("cancel", cancelListener);


// span tag inside li.folder that contains the folder icon and name
var folder_span;

// string containing the name of the currently selected folder
var folder_title;

// id of currently selected folder
var folder_id;

var current_open_folder;

/**
 * Script initializer
 */
$(function() {
    readyFolder();
    folderTypeChange();
    shadeType();
    if (current_folder_id > 0) {
        $('#folder-listing li').each(function(index)
        {
            if ($(this).attr('rel') == current_folder_id) {
                line_span = $(this).find('span');
                openFolder(line_span);
                return;
            }
        });
    }
});


/**
 * changes the folder type (image, document, or multimedia when clicked
 */
function folderTypeChange()
{
    $('select#folder-type').change(function() {
        folder_type = $(this).find(':selected').attr('value');
        refreshFolder();
        shadeType();
        $('#folder-form').hide();
    });
}

function shadeType()
{
    $('#image-button').parent().removeClass('current-type');
    $('#document-button').parent().removeClass('current-type');
    $('#media-button').parent().removeClass('current-type');
    switch (folder_type) {
        case '1':
            $('#image-button').parent().addClass('current-type');
            break;

        case '2':
            $('#document-button').parent().addClass('current-type');
            break;

        case '3':
            $('#media-button').parent().addClass('current-type');
            break;
    }
}


function closeAllFolders()
{
    $('div.folder-file-listing').hide();
    $('img.folder-image').attr('src', folder_closed);
}

/**
 * Prepares folder for a click action which populates it with a list of files
 */
function readyFolder()
{
    folder_span = $('li.folder span');

    closeAllFolders();

    folder_span.click(function() {
        openFolder($(this));
    });
}

function openFolder(folder) {
    current_open_folder = folder;
    folder_title = folder.text();
    folder_id = folder.parent().attr('rel');
    $('#folder-id').val(folder_id);
    $('#folder-form').show();
    $('#ftype').val(folder_type);
    $('#current-folder').html(folder_title);
    folderContents(folder);
}

function refreshFolder()
{
    var refresh_link = 'index.php?module=filecabinet&aop=ck_folder_listing&ftype=' + folder_type;
    $.get(refresh_link, function(data) {
        $('div#folder-listing').html(data);
        $('div#files').html('');
        readyFolder();
    });
}

/**
 * folder_line : current folder used for content request
 */
function folderContents(folder_line)
{
    var line_item = folder_line.parent();
    var folder_id = line_item.attr('rel');
    var folder_link = 'index.php?module=filecabinet&aop=ck_folder_contents&ftype=' + folder_type + '&folder_id=' + folder_id;
    $.getJSON(folder_link, function(data) {
        line_div = line_item.children('div');
        if (data.folders) {
            line_div.html(data.folders);
            $('#files').html(data.file_listing);
            closeAllFolders();
            line_div.slideDown('200');
            line_item.find('img.folder-image').attr('src', folder_open);
        }

        fileClick(folder_line);
    });
}

function fileClick(folder_line)
{
    var file_pick_str = 'div.pick-' + getFolderTypeString();
    var file_pick_obj = $(file_pick_str);
    file_pick_obj.click(function() {
        file_id = $(this).attr('id');
        var file_link = 'index.php?module=filecabinet&aop=ck_file_info&ftype=' + folder_type + '&file_id=' + file_id;

        $.getJSON(file_link, function(data) {
            $('div#files').html(data.html);

            insert_text = data.insert;
            readyButtons(data.title);
        });
    });
}


function getFolderTypeString()
{
    switch(folder_type) {
        case '2':
            return 'document';
        case '3':
            return 'multimedia';
        case '1':
        default:
            return 'image';
    }
}

function readyButtons(title)
{
    $('#ck-file-info input:button').click(function()
    {
        var button_name = $(this).attr('name');
        var file_id = $(this).attr('rel');

        if (button_name == 'edit') {
            new_title = prompt('Change file title below', title);
            if (new_title!=null && new_title!='') {
                edit_link = 'index.php?module=filecabinet&aop=ck_edit_file&ftype=' + folder_type + '&file_id=' + file_id;
                $.get(edit_link, {
                    'title' : new_title
                }, function(data) {
                    folderContents(current_open_folder);
                });
            }
        } else if (button_name == 'delete') {
            confirm_it = confirm('Are you sure you want to delete this file?');
            if (confirm_it == true) {
                delete_link = 'index.php?module=filecabinet&aop=ck_delete_file&ftype=' + folder_type + '&file_id=' + file_id;
                $.get(delete_link, function() {
                    folderContents(current_open_folder);
                });
            }
        }
    });
}