<?php

  /**
   * Simple class to add a module's administrator commands to a box
   *
   * @author Matthew McNaney <mcnaney at gmail dot com>
   * @version $Id$
   */

class MiniAdmin {
    function add($module, $links)
    {
        if (is_array($links)) {
            foreach ($links as $link) {
                MiniAdmin::add($module, $link);
            }
            return true;
        }

        $GLOBALS['MiniAdmin'][$module][] = $links;
        return TRUE;
    }

    function get()
    {
        $modlist = PHPWS_Core::getModuleNames();

        if (!isset($GLOBALS['MiniAdmin'])) {
            return NULL;
        }

        $oTpl = new PHPWS_Template('miniadmin');
        $oTpl->setFile('mini_admin.tpl');
        
        $tpl['MINIADMIN_TITLE'] = dgettext('miniadmin', 'MiniAdmin');
        foreach ($GLOBALS['MiniAdmin'] as $module => $links) {
            foreach ($links as $link) {
                $oTpl->setCurrentBlock('links');
                $oTpl->setData(array('ADMIN_LINK' => PHPWS_Text::fixAmpersand($link)));
                $oTpl->parseCurrentBlock();
            }
            $oTpl->setCurrentBlock('module');
            $oTpl->setData(array('MODULE' => $modlist[$module]));
            $oTpl->parseCurrentBlock();
        }
        $oTpl->setData($tpl);
        $content = $oTpl->get();
        
        Layout::set($content, 'users', 'mini_admin');
    }
}

?>